import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { ArticleService } from '@repo/frontend-services/article';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useApi } from '@/providers/ApiProvider';

const PAGE_LIMIT = 10;

export function useArticlesList() {
  const api = useApi();
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleWithResolvedTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const articleService = useMemo(() => new ArticleService(api), [api]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    void articleService
      .getPublished({ preferredLocale: language, page: 1, limit: PAGE_LIMIT })
      .then((result) => {
        setArticles(result.data);
        setHasMore(result.page < result.totalPages);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [language, articleService]);

  const loadMore = () => {
    if (loadingMore || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    setLoadingMore(true);
    void articleService
      .getPublished({ preferredLocale: language, page: nextPage, limit: PAGE_LIMIT })
      .then((result) => {
        setArticles((prev) => [...prev, ...result.data]);
        setPage(nextPage);
        setHasMore(result.page < result.totalPages);
      })
      .catch(() => {
        // ignore load-more errors silently
      })
      .finally(() => {
        setLoadingMore(false);
      });
  };

  return { articles, loading, loadingMore, error, hasMore, loadMore };
}
