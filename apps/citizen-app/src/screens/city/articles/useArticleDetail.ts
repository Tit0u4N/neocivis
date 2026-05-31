import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useServices } from '@/providers/ServicesProvider';

export function useArticleDetail(id: string) {
  const { articleService } = useServices();
  const { language } = useLanguage();
  const [article, setArticle] = useState<ArticleWithResolvedTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
