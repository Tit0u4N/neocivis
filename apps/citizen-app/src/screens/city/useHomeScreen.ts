import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { ArticleService } from '@repo/frontend-services/article';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useApi } from '@/providers/ApiProvider';

const HOME_LIMIT = 3;

export function useHomeScreen() {
  const api = useApi();
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleWithResolvedTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articleService = useMemo(() => new ArticleService(api), [api]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void articleService
      .getPublished({ preferredLocale: language, page: 1, limit: HOME_LIMIT })
      .then((result) => {
        setArticles(result.data);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [language, articleService]);

  return { articles, loading, error };
}
