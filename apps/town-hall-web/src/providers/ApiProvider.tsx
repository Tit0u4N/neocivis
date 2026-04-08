'use client';

import { createApiClient } from '@repo/frontend-core/api';
import type { KyInstance } from 'ky';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';

type ApiContextValue = {
  api: KyInstance;
};

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export function ApiProvider({children}: { children: ReactNode }) {
  const auth = useAuth();

  // Keep a stable ref so the api client is created once and always reads
  // the latest auth state without being recreated on every auth change.
  const authRef = useRef(auth);
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
        tokenProvider: async () => authRef.current.user?.access_token ?? null,
        onUnauthorized: () => {
          void authRef.current.signinRedirect();
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
