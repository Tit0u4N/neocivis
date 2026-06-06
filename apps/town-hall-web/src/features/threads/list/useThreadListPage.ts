'use client';

import type { UserPublicDto } from '@repo/contracts';
import type { ThreadCategory, ThreadSummary } from '@repo/contracts/thread';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useThreadStore } from '@/stores/thread.store';
import { useUserStore } from '@/stores/user.store';

const PAGE_LIMIT = 20;

function categoryKey(categoryId: string | undefined): string {
  return categoryId ?? 'all';
}

export function useThreadListPage() {
  const router = useRouter();
  const { threadService, userService } = useServices();

  // Stable action selectors — Zustand guarantees same function ref across renders
  const setCategories = useThreadStore((s) => s.setCategories);
  const setModeration = useThreadStore((s) => s.setModeration);
  const setPage = useThreadStore((s) => s.setPage);
  const appendPage = useThreadStore((s) => s.appendPage);
  const invalidate = useThreadStore((s) => s.invalidate);
  const mergeUsers = useUserStore((s) => s.mergeUsers);
  const getMissingIds = useUserStore((s) => s.getMissingIds);

  // Data selectors — only re-render when this slice changes
  const categories: ThreadCategory[] = useThreadStore((s) => s.categories);
  const moderation = useThreadStore((s) => s.moderation);
  const users = useUserStore((s) => s.users);

  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);

  const key = categoryKey(activeCategoryId);
  const cache = useThreadStore((s) => s.pages[key]);
  const threads: ThreadSummary[] = cache?.threads ?? [];
  const hasMore = cache?.hasMore ?? false;
  const currentPage = cache?.page ?? 0;

  const mutedCount = moderation.filter((m) => m.muted).length;
  const bannedCount = moderation.filter((m) => m.banned).length;

  const fetchCategories = useCallback(async () => {
    // Read current state without adding to deps — avoids cascade re-runs
    if (useThreadStore.getState().categories.length > 0) {
      return;
    }
    try {
      const data = await threadService.getCategories();
      setCategories(data);
    } catch {
      // Non-blocking; category filter won't show but threads still work
    }
  }, [threadService.getCategories, setCategories]);

  const fetchModeration = useCallback(async () => {
    try {
      const data = await threadService.getModeration();
      setModeration(data);
    } catch {
      // Non-blocking
    }
  }, [threadService.getModeration, setModeration]);

  const resolveAuthors = useCallback(
    async (threads: ThreadSummary[]) => {
      const missing = getMissingIds(Array.from(new Set(threads.map((t) => t.authorId))));
      if (missing.length === 0) {
        return;
      }
      try {
        const fetched = await userService.getByIds(missing);
        mergeUsers(fetched);
      } catch {
        // Non-blocking — display fallback if resolution fails
      }
    },
    [userService.getByIds, getMissingIds, mergeUsers],
  );

  const fetchPage1 = useCallback(
    async (force = false) => {
      const cacheKey = categoryKey(activeCategoryId);
      if (!force && useThreadStore.getState().pages[cacheKey]) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await threadService.getAll({ categoryId: activeCategoryId, page: 1, limit: PAGE_LIMIT });
        setPage(cacheKey, response);
        void resolveAuthors(response.data);
      } catch {
        setError('threads.list.error');
      } finally {
        setIsLoading(false);
      }
    },
    [threadService.getAll, activeCategoryId, setPage, resolveAuthors],
  );

  const handleLoadMore = useCallback(async () => {
    const cacheKey = categoryKey(activeCategoryId);
    const pageCache = useThreadStore.getState().pages[cacheKey];
    if (!pageCache?.hasMore || isLoadingMore) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const response = await threadService.getAll({
        categoryId: activeCategoryId,
        page: pageCache.page + 1,
        limit: PAGE_LIMIT,
      });
      appendPage(cacheKey, response);
      void resolveAuthors(response.data);
    } catch {
      // TODO add user feedback; user can retry
    } finally {
      setIsLoadingMore(false);
    }
  }, [threadService.getAll, activeCategoryId, appendPage, isLoadingMore, resolveAuthors]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchModeration();
  }, [fetchModeration]);

  useEffect(() => {
    void fetchPage1();
  }, [fetchPage1]);

  const handleSelectCategory = useCallback((id: string | undefined) => {
    setActiveCategoryId(id);
  }, []);

  const handleOpenNewThread = useCallback(() => {
    setShowNewThreadModal(true);
  }, []);

  const handleCloseNewThread = useCallback(() => {
    setShowNewThreadModal(false);
  }, []);

  const handleThreadCreated = useCallback(async () => {
    setShowNewThreadModal(false);
    invalidate();
    await fetchPage1(true);
    await fetchModeration();
  }, [invalidate, fetchPage1, fetchModeration]);

  const navigateToThread = useCallback(
    (id: string) => {
      router.push(`/dashboard/threads/${id}`);
    },
    [router],
  );

  const resolveUser = useCallback((authorId: number): UserPublicDto | undefined => users[authorId], [users]);

  return {
    categories,
    threads,
    activeCategoryId,
    isLoading,
    isLoadingMore,
    hasMore,
    currentPage,
    error,
    showNewThreadModal,
    mutedCount,
    bannedCount,
    handleSelectCategory,
    handleOpenNewThread,
    handleCloseNewThread,
    handleThreadCreated,
    handleLoadMore,
    navigateToThread,
    resolveUser,
  };
}
