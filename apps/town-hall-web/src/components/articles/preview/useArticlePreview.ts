'use client';

import type { Article, ArticleLocale } from '@repo/contracts/article';
import { useEffect, useState } from 'react';

export type PreviewViewMode = 'web' | 'mobile';

export function useArticlePreview(article: Article | null) {
  const [viewMode, setViewMode] = useState<PreviewViewMode>('web');
  const [locale, setLocale] = useState<ArticleLocale>('fr');

  // Si la locale courante n'existe pas pour l'article, on retombe sur 'fr' ou la première dispo
  useEffect(() => {
    if (!article) {
      return;
    }
    const hasCurrent = article.translations.some((t) => t.locale === locale);
    if (!hasCurrent) {
      const fallback = (article.translations.find((t) => t.locale === 'fr')?.locale ??
        article.translations[0]?.locale ??
        'fr') as ArticleLocale;
      setLocale(fallback);
    }
  }, [article, locale]);

  const translation = article?.translations.find((t) => t.locale === locale);
  const availableLocales = (article?.translations.map((t) => t.locale) ?? ['fr']) as ArticleLocale[];

  return {
    article,
    title: translation?.title ?? '',
    description: translation?.description ?? '',
    content: (translation?.content as unknown[]) ?? [],
    coverImageUrl: article?.coverImageUrl ?? '',
    status: article?.status ?? 'draft',
    viewMode,
    setViewMode,
    locale,
    setLocale,
    availableLocales,
  };
}
