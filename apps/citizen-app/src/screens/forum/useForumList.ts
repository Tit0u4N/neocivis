import type { UserPublicDto } from '@repo/contracts';
import type { ThreadCategory, ThreadSummary } from '@repo/contracts/thread';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useUserStore } from '@/stores/user.store';

const PAGE_LIMIT = 20;

export function useForumList() {
  const { threadService, userService } = useServices();
  const { users, mergeUsers, getMissingIds } = useUserStore();
  const [categories, setCategories] = useState<ThreadCategory[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const resolveAuthors = useCallback(
    async (items: ThreadSummary[]) => {
      const missing = getMissingIds(Array.from(new Set(items.map((t) => t.authorId))));
      if (missing.length === 0) {
        return;
      }
      try {
        const fetched = await userService.getByIds(missing);
        mergeUsers(fetched);
      } catch {
        // non-blocking
      }
    },
    [userService, getMissingIds, mergeUsers],
  );

  useEffect(() => {
    void threadService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, [threadService]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    void threadService
      .getAll({ categoryId: selectedCategoryId, page: 1, limit: PAGE_LIMIT })
      .then((result) => {
        setThreads(result.data);
        setHasMore(result.page < result.totalPages);
        void resolveAuthors(result.data);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategoryId, threadService, resolveAuthors]);

  const loadMore = () => {
    if (loadingMore || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    setLoadingMore(true);
    void threadService
      .getAll({ categoryId: selectedCategoryId, page: nextPage, limit: PAGE_LIMIT })
      .then((result) => {
        setThreads((prev) => [...prev, ...result.data]);
        setPage(nextPage);
        setHasMore(result.page < result.totalPages);
        void resolveAuthors(result.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoadingMore(false);
      });
  };

  const selectCategory = (id: string | undefined) => {
    setSelectedCategoryId(id);
  };

  const resolveUser = useCallback((authorId: number): UserPublicDto | undefined => users[authorId], [users]);

  return {
    categories,
    threads,
    selectedCategoryId,
    selectCategory,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    resolveUser,
  };
}
