import { exchangeCodeAsync, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { KEYCLOAK_AUTHORITY, authConfig } from '@/config/authConfig';
import { refreshAccessToken } from '@/services/tokenRefresh';
import { clearTokens, getAccessToken, isTokenExpired, saveTokens } from '@/services/tokenStorage';

WebBrowser.maybeCompleteAuthSession();

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

//todo : review this when the auth is fix
function parseJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
    return {
      sub: payload.sub as string,
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      given_name: payload.given_name as string | undefined,
      family_name: payload.family_name as string | undefined,
    };
  } catch {
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
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []); // mount-only — authority captured via ref

  // Handle auth code exchange after the browser redirects back to the app.
  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }
    const code = response.params.code;
    const codeVerifier = request?.codeVerifier;
    if (!code || !codeVerifier || !discovery) {
      return;
    }

    setIsLoading(true);

    const exchangeCode = async () => {
      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: authConfig.clientId,
            code,
            redirectUri: authConfig.redirectUri,
            extraParams: { code_verifier: codeVerifier },
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
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void exchangeCode();
  }, [response, request?.codeVerifier, discovery]);

  const login = async () => {
    setIsLoading(true);
    try {
      const result = await promptAsync();
      // Success is handled by the exchange effect above.
      // For dismiss/error we reset loading here immediately.
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
