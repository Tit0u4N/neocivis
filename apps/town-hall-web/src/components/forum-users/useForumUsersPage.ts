'use client';

import type { ForumUserModeration } from '@repo/contracts/thread';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export function useForumUsersPage(): ForumUsersPageViewModel {
  const { cityService, threadService } = useServices();
  const cityId = useCityStore((s) => s.cityId);

  const [entries, setEntries] = useState<ForumUserEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ForumUserTab>('active');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!cityId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [citizens, moderation] = await Promise.all([
        cityService.listCitizens(cityId),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [cityService, threadService, cityId]);

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
        setEntries((prev) =>
          prev.map((e) => (e.userId === userId ? { ...e, banned: true, bannedAt: new Date().toISOString() } : e)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du bannissement');
      }
    },
    [threadService],
  );

  const unbanUser = useCallback(
    async (userId: number) => {
      try {
        await threadService.unbanUser(userId);
        setEntries((prev) => prev.map((e) => (e.userId === userId ? { ...e, banned: false, bannedAt: null } : e)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du débannissement');
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
