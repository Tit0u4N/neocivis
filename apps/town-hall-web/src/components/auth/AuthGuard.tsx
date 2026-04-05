'use client';

import type { ReactNode } from 'react';
import { useAuthGuard } from './useAuthGuard';

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * Wraps protected content. Redirects to Keycloak login when unauthenticated.
 * Renders nothing while the auth state is loading or the redirect is in progress.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthGuard();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
