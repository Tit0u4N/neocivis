import type { UserPublicDto } from '@repo/contracts';
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react';

type UserStore = {
  users: Record<number, UserPublicDto>;
  mergeUsers: (users: UserPublicDto[]) => void;
  getUser: (id: number) => UserPublicDto | undefined;
  getMissingIds: (ids: number[]) => number[];
};

const UserContext = createContext<UserStore | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Record<number, UserPublicDto>>({});
  // Keep a ref in sync so getMissingIds/getUser don't need users in deps
  const usersRef = useRef(users);

  const mergeUsers = useCallback((incoming: UserPublicDto[]) => {
    setUsers((prev) => {
      const next = { ...prev };
      for (const u of incoming) {
        next[u.id] = u;
      }
      usersRef.current = next;
      return next;
    });
  }, []);

  const getUser = useCallback((id: number): UserPublicDto | undefined => usersRef.current[id], []);

  const getMissingIds = useCallback((ids: number[]): number[] => ids.filter((id) => !usersRef.current[id]), []);

  return <UserContext.Provider value={{ users, mergeUsers, getUser, getMissingIds }}>{children}</UserContext.Provider>;
}

export function useUserStore(): UserStore {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserStore must be used inside UserProvider');
  }
  return ctx;
}
