import type { ThreadCategory, ThreadSummary } from '@repo/contracts/thread';
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

const PAGE_LIMIT = 20;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ALL_KEY = '__all__';

type CategoryCache = {
  threads: ThreadSummary[];
  page: number;
  hasMore: boolean;
  fetchedAt: number;
};

type ForumStore = {
  categories: ThreadCategory[];
  threads: ThreadSummary[];
  selectedCategoryId: string | undefined;
  selectCategory: (id: string | undefined) => void;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadInitial: () => void;
  loadMore: () => void;
  refresh: () => void;
};

const ForumContext = createContext<ForumStore | undefined>(undefined);

export function ForumProvider({ children }: { children: ReactNode }) {
  const { threadService } = useServices();

  const [categories, setCategories] = useState<ThreadCategory[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Per-category cache keyed by categoryId or ALL_KEY
  const cache = useRef<Map<string, CategoryCache>>(new Map());
  const categoriesLoaded = useRef(false);

  const cacheKey = (catId: string | undefined) => catId ?? ALL_KEY;

  const isFresh = (key: string) => {
    const entry = cache.current.get(key);
    return entry !== undefined && Date.now() - entry.fetchedAt < CACHE_TTL;
  };

  const fetchCategories = useCallback(() => {
    if (categoriesLoaded.current) {
      return;
    }
    void threadService
      .getCategories()
      .then((cats) => {
        setCategories(cats);
        categoriesLoaded.current = true;
      })
      .catch(() => {});
  }, [threadService]);

  const fetchPage = useCallback(
    (pageNum: number, append: boolean, catId: string | undefined) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const key = cacheKey(catId);
      void threadService
        .getAll({ categoryId: catId, page: pageNum, limit: PAGE_LIMIT })
        .then((result) => {
          const existing = append ? (cache.current.get(key)?.threads ?? []) : [];
          const merged = [...existing, ...result.data];
          const newHasMore = result.page < result.totalPages;
          setThreads(merged);
          setPage(pageNum);
          setHasMore(newHasMore);
          cache.current.set(key, { threads: merged, page: pageNum, hasMore: newHasMore, fetchedAt: Date.now() });
        })
        .catch(() => {
          setError('error');
        })
        .finally(() => {
          if (pageNum === 1) {
            setLoading(false);
          } else {
            setLoadingMore(false);
          }
        });
    },
    [threadService],
  );

  const restoreFromCache = (key: string) => {
    const entry = cache.current.get(key);
    if (!entry) {
      return;
    }
    setThreads(entry.threads);
    setPage(entry.page);
    setHasMore(entry.hasMore);
    setError(null);
  };

  const loadInitial = useCallback(() => {
    const key = cacheKey(selectedCategoryId);
    if (isFresh(key)) {
      restoreFromCache(key);
      return;
    }
    fetchCategories();
    fetchPage(1, false, selectedCategoryId);
  }, [fetchCategories, fetchPage, selectedCategoryId, cacheKey, isFresh, restoreFromCache]);

  const selectCategory = useCallback(
    (id: string | undefined) => {
      setSelectedCategoryId(id);
      const key = cacheKey(id);
      if (isFresh(key)) {
        restoreFromCache(key);
        return;
      }
      setThreads([]);
      setPage(1);
      setHasMore(true);
      fetchPage(1, false, id);
    },
    [fetchPage, cacheKey, restoreFromCache],
  );

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      return;
    }
    fetchPage(page + 1, true, selectedCategoryId);
  }, [loadingMore, hasMore, page, fetchPage, selectedCategoryId]);

  const refresh = useCallback(() => {
    cache.current.delete(cacheKey(selectedCategoryId));
    fetchPage(1, false, selectedCategoryId);
  }, [fetchPage, selectedCategoryId]);

  return (
    <ForumContext.Provider
      value={{
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
        refresh,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
}

export function useForumStore(): ForumStore {
  const ctx = useContext(ForumContext);
  if (!ctx) {
    throw new Error('useForumStore must be used inside ForumProvider');
  }
  return ctx;
}
