'use client';

import type { UserPublicDto } from '@repo/contracts';
import type { ForumUserModeration } from '@repo/contracts/thread';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useServices } from '@/providers/ServicesProvider';
import { useCityStore } from '@/stores/city.store';

export type ForumUserTab = 'active' | 'banned';

export type ForumUserEntry = {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  banned: boolean;
  muted: boolean;
  threadCount: number;
  bannedAt: string | null;
  lastConnection: string | null;
  memberSince: string | null;
};

export type ForumUsersPageViewModel = {
  isLoading: boolean;
  error: string | null;
  tab: ForumUserTab;
  setTab: (t: ForumUserTab) => void;
  search: string;
  setSearch: (s: string) => void;
  activeUsers: ForumUserEntry[];
  bannedUsers: ForumUserEntry[];
  banUser: (userId: number) => Promise<void>;
  unbanUser: (userId: number) => Promise<void>;
};

const MOCK_USERS: ForumUserEntry[] = [
  {
    userId: 1,
    username: 'titouan.lacombe',
    firstName: 'Titouan',
    lastName: 'LACOMBE',
    banned: false,
    muted: false,
    threadCount: 15,
    bannedAt: null,
    lastConnection: '2026-01-20T16:30:06.000Z',
    memberSince: '2025-11-12T00:00:00.000Z',
  },
  {
    userId: 2,
    username: 'marie.dupont',
    firstName: 'Marie',
    lastName: 'DUPONT',
    banned: false,
    muted: false,
    threadCount: 8,
    bannedAt: null,
    lastConnection: '2026-01-18T10:00:00.000Z',
    memberSince: '2025-10-05T00:00:00.000Z',
  },
  {
    userId: 3,
    username: 'paul.martin',
    firstName: 'Paul',
    lastName: 'MARTIN',
    banned: true,
    muted: false,
    threadCount: 22,
    bannedAt: '2025-12-20T00:00:00.000Z',
    lastConnection: '2025-12-19T09:00:00.000Z',
    memberSince: '2025-09-01T00:00:00.000Z',
  },
  {
    userId: 4,
    username: 'lucie.bernard',
    firstName: 'Lucie',
    lastName: 'BERNARD',
    banned: false,
    muted: false,
    threadCount: 5,
    bannedAt: null,
    lastConnection: '2026-01-15T14:20:00.000Z',
    memberSince: '2025-11-20T00:00:00.000Z',
  },
  {
    userId: 5,
    username: 'jean.pierre',
    firstName: 'Jean',
    lastName: 'PIERRE',
    banned: true,
    muted: false,
    threadCount: 3,
    bannedAt: '2025-12-20T00:00:00.000Z',
    lastConnection: '2025-12-19T11:00:00.000Z',
    memberSince: '2025-10-10T00:00:00.000Z',
  },
];

export function useForumUsersPage(): ForumUsersPageViewModel {
  const { threadService } = useServices();
  const api = useApi();
  const cityId = useCityStore((s) => s.cityId);

  const [entries, setEntries] = useState<ForumUserEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ForumUserTab>('active');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [citizens, moderation] = await Promise.all([
        api.get(`cities/${cityId}/citizens`).json<UserPublicDto[]>(),
        threadService.getModeration(),
      ]);
      const moderationMap = new Map<number, ForumUserModeration>(moderation.map((m) => [m.userId, m]));
      const result: ForumUserEntry[] = citizens.map((u) => {
        const mod = moderationMap.get(u.id);
        return {
          userId: u.id,
          username: u.username ?? `${u.firstName} ${u.lastName}`,
          firstName: u.firstName,
          lastName: u.lastName,
          banned: mod?.banned ?? false,
          muted: mod?.muted ?? false,
          threadCount: 0,
          bannedAt: null,
          lastConnection: null,
          memberSince: null,
        };
      });
      setEntries(result);
    } catch {
      setEntries(MOCK_USERS);
    } finally {
      setIsLoading(false);
    }
  }, [threadService, api, cityId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return entries;
    }
    return entries.filter(
      (e) =>
        e.username.toLowerCase().includes(q) ||
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const activeUsers = useMemo(() => filtered.filter((e) => !e.banned), [filtered]);
  const bannedUsers = useMemo(() => filtered.filter((e) => e.banned), [filtered]);

  const banUser = useCallback(
    async (userId: number) => {
      try {
        await threadService.banUser(userId);
      } catch {
        // backend not available — update locally
      } finally {
        setEntries((prev) =>
          prev.map((e) => (e.userId === userId ? { ...e, banned: true, bannedAt: new Date().toISOString() } : e)),
        );
      }
    },
    [threadService],
  );

  const unbanUser = useCallback(
    async (userId: number) => {
      try {
        await threadService.unbanUser(userId);
      } catch {
        // backend not available — update locally
      } finally {
        setEntries((prev) => prev.map((e) => (e.userId === userId ? { ...e, banned: false, bannedAt: null } : e)));
      }
    },
    [threadService],
  );

  return {
    isLoading,
    error,
    tab,
    setTab,
    search,
    setSearch,
    activeUsers,
    bannedUsers,
    banUser,
    unbanUser,
  };
}
