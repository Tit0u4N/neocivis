import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { ArticleService } from '@repo/frontend-services/article';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useApi } from '@/providers/ApiProvider';

export function useArticleDetail(id: string) {
  const api = useApi();
  const { language } = useLanguage();
  const [article, setArticle] = useState<ArticleWithResolvedTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articleService = useMemo(() => new ArticleService(api), [api]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void articleService
      .getByIdResolved(id, language)
      .then((result) => {
        setArticle(result);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, language, articleService]);

  return { article, loading, error };
}
