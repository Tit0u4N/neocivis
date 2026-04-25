'use client';

import type { Article } from '@repo/contracts/article';
import { useState } from 'react';

export type PreviewViewMode = 'web' | 'mobile';

export function useArticlePreview(article: Article | null) {
  const frTranslation = article?.translations.find((t) => t.locale === 'fr');
  const [viewMode, setViewMode] = useState<PreviewViewMode>('web');

  return {
    article,
    title: frTranslation?.title ?? '',
    description: frTranslation?.description ?? '',
    content: (frTranslation?.content as unknown[]) ?? [],
    coverImageUrl: article?.coverImageUrl ?? '',
    status: article?.status ?? 'draft',
    viewMode,
    setViewMode,
  };
}
