import type { UserPublicDto } from '@repo/contracts';
import type { ThreadSummary } from '@repo/contracts/thread';
import { useCallback, useEffect } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useForumStore } from '@/stores/forum.store';
import { useUserStore } from '@/stores/user.store';

export function useForumList() {
  const { userService } = useServices();
  const { users, mergeUsers, getMissingIds } = useUserStore();
  const {
    categories,
    threads,
    selectedCategoryId,
    selectCategory,
    loading,
    loadingMore,
    error,
    hasMore,
    loadInitial,
    loadMore,
  } = useForumStore();

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

  // Trigger initial load once (store guards with `loaded` ref)
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Resolve authors whenever thread list changes
  useEffect(() => {
    if (threads.length > 0) {
      void resolveAuthors(threads);
    }
  }, [threads, resolveAuthors]);

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
