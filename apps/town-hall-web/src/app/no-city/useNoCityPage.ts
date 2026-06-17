'use client';

import { useAuthentication } from '@/hooks/useAuthentication';

export type NoCityPageState = {
  handleLogout: () => void;
};

/** Business logic for the "no managed city" error page. */
export function useNoCityPage(): NoCityPageState {
  const { logout } = useAuthentication();

  return {
    handleLogout: () => {
      void logout();
    },
  };
}
