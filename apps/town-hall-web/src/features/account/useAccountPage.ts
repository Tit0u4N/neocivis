'use client';

import { useCallback } from 'react';
import { useAuthentication } from '@/hooks/useAuthentication';

export type AccountPageState = {
  user: { name: string; email: string } | null;
  handleLogout: () => void;
};

export function useAccountPage(): AccountPageState {
  const { user, logout } = useAuthentication();

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  const profile =
    user !== null && user !== undefined
      ? {
          name: user.profile.name ?? user.profile.preferred_username ?? '',
          email: (user.profile.email as string | undefined) ?? '',
        }
      : null;

  return { user: profile, handleLogout };
}
