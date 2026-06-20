import { exchangeCodeAsync, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { authConfig, KEYCLOAK_AUTHORITY } from '@/config/authConfig';
import { refreshAccessToken } from '@/services/tokenRefresh';
import { clearTokens, getAccessToken, isTokenExpired, saveTokens } from '@/services/tokenStorage';

const PKCE_STORAGE_PREFIX = 'neocivis.pkce_verifier.';

function hasPendingWebRedirect(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && params.has('state');
}

export type AuthUser = {
  sub: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export type AuthProviderProps = {
  children: ReactNode;
  /**
   * Keycloak realm URL — defaults to EXPO_PUBLIC_KEYCLOAK_AUTHORITY env var.
   * Pass as a prop for multi-tenant setups where the realm is determined at runtime.
   */
  authority?: string;
};

function parseJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    // JWT body is base64url-encoded — atob expects base64, so swap chars and pad.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    return {
      sub: payload.sub as string,
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      given_name: payload.given_name as string | undefined,
      family_name: payload.family_name as string | undefined,
    };
  } catch (_) {
    return null;
  }
}

export function AuthProvider({ children, authority = KEYCLOAK_AUTHORITY }: AuthProviderProps) {
  // Stable ref so the mount effect always uses the initial authority without re-running.
  const authorityRef = useRef(authority);

  const discovery = useAutoDiscovery(authority);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: authConfig.clientId,
      scopes: authConfig.scopes,
      redirectUri: authConfig.redirectUri,
      usePKCE: true,
    },
    discovery,
  );

  // Restore persisted session from SecureStore on mount.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const expired = await isTokenExpired();
        if (!expired) {
          const token = await getAccessToken();
          if (token !== null) {
            setUser(parseJwtPayload(token));
            return;
          }
        }
        // Token absent or expired — attempt silent refresh before giving up.
        const newToken = await refreshAccessToken(authorityRef.current);
        if (newToken !== null) {
          setUser(parseJwtPayload(newToken));
        }
      } catch {
        // No valid session — stay unauthenticated.
      } finally {
        // On web, if a callback (?code=&state=) is present, keep loading — the web-redirect
        // effect will exchange the code and clear loading itself.
        if (!hasPendingWebRedirect()) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();
  }, []); // mount-only — authority captured via ref

  // Capture verifier at the moment the response arrives to avoid stale closure
  // when discovery/request regenerates before the exchange effect fires.
  const pendingExchangeRef = useRef<{ code: string; codeVerifier: string } | null>(null);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const code = response.params.code;
    const codeVerifier = request?.codeVerifier;
    if (code && codeVerifier) {
      pendingExchangeRef.current = { code, codeVerifier };
    }
  }, [response, request?.codeVerifier]);

  // Handle auth code exchange after the browser redirects back to the app.
  useEffect(() => {
    if (response?.type !== 'success') return;
    if (!discovery) return;

    const pending = pendingExchangeRef.current;
    if (!pending) return;
    pendingExchangeRef.current = null;

    setIsLoading(true);

    const exchangeCode = async () => {
      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: authConfig.clientId,
            code: pending.code,
            redirectUri: authConfig.redirectUri,
            extraParams: { code_verifier: pending.codeVerifier },
          },
          discovery,
        );

        const expiresAt = Date.now() + (tokenResponse.expiresIn ?? 300) * 1000;
        await saveTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken ?? '',
          tokenResponse.idToken ?? null,
          expiresAt,
        );
        setUser(parseJwtPayload(tokenResponse.accessToken));
      } catch (e) {
        console.log('[Auth] exchange failed:', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void exchangeCode();
  }, [response, discovery]);

  // Web full-page redirect recovery: useAuthRequest is recreated on reload and loses
  // the original codeVerifier, so we persist it ourselves and complete the exchange here.
  useEffect(() => {
    if (Platform.OS !== 'web' || !discovery || typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!(code && state)) {
      return;
    }
    const verifier = sessionStorage.getItem(`${PKCE_STORAGE_PREFIX}${state}`);
    if (!verifier) {
      return;
    }

    sessionStorage.removeItem(`${PKCE_STORAGE_PREFIX}${state}`);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('session_state');
    url.searchParams.delete('iss');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);

    setIsLoading(true);
    // biome-ignore lint/nursery/noFloatingPromises: Auth
    (async () => {
      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: authConfig.clientId,
            code,
            redirectUri: authConfig.redirectUri,
            extraParams: { code_verifier: verifier },
          },
          discovery,
        );
        const expiresAt = Date.now() + (tokenResponse.expiresIn ?? 300) * 1000;
        await saveTokens(
          tokenResponse.accessToken,
          tokenResponse.refreshToken ?? '',
          tokenResponse.idToken ?? null,
          expiresAt,
        );
        setUser(parseJwtPayload(tokenResponse.accessToken));
      } catch (_) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [discovery]);

  const login = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web' && request?.codeVerifier && request?.state) {
        sessionStorage.setItem(`${PKCE_STORAGE_PREFIX}${request.state}`, request.codeVerifier);
      }
      const result = await promptAsync();
      if (result.type !== 'success') {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);

    if (discovery?.endSessionEndpoint) {
      try {
        await WebBrowser.openBrowserAsync(
          `${discovery.endSessionEndpoint}?client_id=${authConfig.clientId}&post_logout_redirect_uri=${encodeURIComponent(authConfig.redirectUri)}`,
        );
      } catch {
        // End-session endpoint failure is non-fatal — tokens are already cleared locally.
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
