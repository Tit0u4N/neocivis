import { createApiClient } from '@repo/frontend-core/api';
import type { KyInstance } from 'ky';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { KEYCLOAK_AUTHORITY } from '@/config/authConfig';
import { createCitizenDemoFetch } from '@/demo/demo-fetch';
import { DEMO_API_BASE_URL, IS_DEMO_MODE } from '@/demo/demo-mode';
import { useAuth } from '@/providers/AuthProvider';
import { refreshAccessToken } from '@/services/tokenRefresh';
import { getAccessToken, isTokenExpired } from '@/services/tokenStorage';

type ApiContextValue = {
  api: KyInstance;
};

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const { login } = useAuth();

  // Stable ref so the ky client is created once and always reads the latest login callback.
  const loginRef = useRef(login);
  useEffect(() => {
    loginRef.current = login;
  }, [login]);

  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: IS_DEMO_MODE ? DEMO_API_BASE_URL : (process.env.EXPO_PUBLIC_API_BASE_URL ?? ''),
        fetch: IS_DEMO_MODE ? createCitizenDemoFetch() : undefined,
        tokenProvider: async () => {
          const expired = await isTokenExpired();
          if (!expired) {
            return getAccessToken();
          }
          return refreshAccessToken(KEYCLOAK_AUTHORITY);
        },
        onUnauthorized: () => {
          void loginRef.current();
        },
      }),
    [],
  );

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export function useApi(): KyInstance {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used inside ApiProvider');
  }
  return context.api;
}
