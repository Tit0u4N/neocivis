import type { UserPublicDto } from '@repo/contracts';
import { create } from 'zustand';

type UserStore = {
  users: Record<number, UserPublicDto>;
  mergeUsers: (users: UserPublicDto[]) => void;
  getUser: (id: number) => UserPublicDto | undefined;
  getMissingIds: (ids: number[]) => number[];
};

export const useUserStore = create<UserStore>()((set, get) => ({
  users: {},

  mergeUsers: (users) =>
    set((state) => {
      const next = { ...state.users };
      for (const u of users) {
        next[u.id] = u;
      }
      return { users: next };
    }),

  getUser: (id) => get().users[id],

  getMissingIds: (ids) => ids.filter((id) => get().users[id] === undefined),
}));
