import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import type { CarouselItemResolved, CategoryLink } from '@repo/contracts/config';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/providers/AuthProvider';
import { useServices } from '@/providers/ServicesProvider';

const HOME_PREVIEW_LIMIT = 3;

export type Category = {
  id: string;
  link?: CategoryLink;
  name: string;
  icon: string; // PascalCase Lucide icon name, e.g. 'Star', 'TriangleAlert'
  color: string;
  row?: number; // 0-indexed grid row
  col?: number; // 0-indexed grid col (0..2)
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
};

export function useHomeScreen() {
  const { articleService, configService } = useServices();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [articles, setArticles] = useState<ArticleWithResolvedTranslation[]>([]);
  const [carouselItems, setCarouselItems] = useState<CarouselItemResolved[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setArticlesLoading(true);
    setError(null);
    void articleService
      .getPublished({ preferredLocale: language, page: 1, limit: HOME_PREVIEW_LIMIT })
      .then((result) => {
        setArticles(result.data);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setArticlesLoading(false);
      });
  }, [language, articleService]);

  useEffect(() => {
    setCarouselLoading(true);
    void configService
      .getConfig(language)
      .then((config) => {
        setCarouselItems(config.carousel);
        setCategories(config.categories);
      })
      .finally(() => {
        setCarouselLoading(false);
      });
  }, [language, configService]);

  const previewArticles = useMemo(() => articles.slice(0, HOME_PREVIEW_LIMIT), [articles]);

  return { carouselItems, previewArticles, articlesLoading, carouselLoading, error, categories, user };
}
