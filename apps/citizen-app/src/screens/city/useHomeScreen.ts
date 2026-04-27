import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { ArticleService } from '@repo/frontend-services/article';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useApi } from '@/providers/ApiProvider';
import { useAuth } from '@/providers/AuthProvider';

const HOME_HERO_LIMIT = 5;
const HOME_PREVIEW_LIMIT = 3;

export type Category = {
  id: string;
  name: string;
  icon: string; // PascalCase Lucide icon name, e.g. 'Star', 'TriangleAlert'
  color: string;
  row?: number; // 0-indexed grid row
  col?: number; // 0-indexed grid col (0..2)
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
};

// Placeholder — replace with GET /api/citizen/categories once backend endpoint is ready
const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: 'alaune', name: 'À la Une', icon: 'Star', color: '#F42500', row: 0, col: 0, colSpan: 2 },
  { id: 'pratique', name: 'Pratique', icon: 'Info', color: '#0C8CE9', row: 0, col: 2 },
  { id: 'urgence', name: 'Urgence', icon: 'TriangleAlert', color: '#D97706', row: 1, col: 0 },
  { id: 'travaux', name: 'Travaux', icon: 'Wrench', color: '#64748B', row: 1, col: 1, colSpan: 2 },
  { id: 'sondage', name: 'Sondage', icon: 'BarChart2', color: '#16A34A', row: 2, col: 0 },
  { id: 'divers', name: 'Divers', icon: 'Globe', color: '#7C3AED', row: 2, col: 1 },
];

export function useHomeScreen() {
  const api = useApi();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [articles, setArticles] = useState<ArticleWithResolvedTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articleService = useMemo(() => new ArticleService(api), [api]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void articleService
      .getPublished({ preferredLocale: language, page: 1, limit: HOME_HERO_LIMIT + HOME_PREVIEW_LIMIT })
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

  const heroArticles = useMemo(() => articles.slice(0, HOME_HERO_LIMIT), [articles]);
  const previewArticles = useMemo(() => articles.slice(0, HOME_PREVIEW_LIMIT), [articles]);

  // TODO: fetch from GET /api/citizen/categories
  const categories = PLACEHOLDER_CATEGORIES;

  return { heroArticles, previewArticles, loading, error, categories, user };
}
