import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useServices } from '@/providers/ServicesProvider';

const PAGE_LIMIT = 10;

type ArticlesStore = {
  articles: ArticleWithResolvedTranslation[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadInitial: () => void;
  loadMore: () => void;
  refresh: () => void;
};

const ArticlesContext = createContext<ArticlesStore | undefined>(undefined);

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const { articleService } = useServices();
  const { language } = useLanguage();

  const [articles, setArticles] = useState<ArticleWithResolvedTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaded = useRef(false);

  const fetchPage = useCallback(
    (pageNum: number, append: boolean) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      void articleService
        .getPublished({ preferredLocale: language, page: pageNum, limit: PAGE_LIMIT })
        .then((result) => {
          if (append) {
            setArticles((prev) => [...prev, ...result.data]);
          } else {
            setArticles(result.data);
          }
          setPage(pageNum);
          setHasMore(result.page < result.totalPages);
          loaded.current = true;
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
    [articleService, language],
  );

  // Reset cache when city or language changes
  useEffect(() => {
    loaded.current = false;
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const loadInitial = useCallback(() => {
    if (loaded.current) {
      return;
    }
    fetchPage(1, false);
  }, [fetchPage]);

  const refresh = useCallback(() => {
    loaded.current = false;
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      return;
    }
    fetchPage(page + 1, true);
  }, [loadingMore, hasMore, page, fetchPage]);

  return (
    <ArticlesContext.Provider
      value={{ articles, loading, loadingMore, error, hasMore, loadInitial, loadMore, refresh }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticlesStore(): ArticlesStore {
  const ctx = useContext(ArticlesContext);
  if (!ctx) {
    throw new Error('useArticlesStore must be used inside ArticlesProvider');
  }
  return ctx;
}
