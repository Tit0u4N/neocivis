'use client';

import { useEffect } from 'react';
import { useAuthentication } from '@/hooks/useAuthentication';

export type AuthGuardState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useAuthGuard(): AuthGuardState {
  const { isAuthenticated, isLoading, login } = useAuthentication();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }
    void login();
  }, [isLoading, isAuthenticated, login]);

  return { isAuthenticated, isLoading };
}
