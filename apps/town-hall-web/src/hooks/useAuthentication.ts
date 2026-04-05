'use client';

import type { User } from 'oidc-client-ts';
import { useAuth } from 'react-oidc-context';

export type AuthenticationState = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useAuthentication(): AuthenticationState {
  const auth = useAuth();

  return {
    login: () => auth.signinRedirect(),
    logout: () => auth.signoutRedirect(),
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
  };
}
