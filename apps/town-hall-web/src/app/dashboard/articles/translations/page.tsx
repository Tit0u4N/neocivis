'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArticleTranslationsPage } from '@/features/articles/translation/ArticleTranslationsPage';
import { useArticleTranslationsPage } from '@/features/articles/translation/useArticleTranslationsPage';

/** L'identifiant est passé en query param (`?id=`) pour rester compatible avec l'export statique. */
function ArticleTranslationsRouteContent() {
  const id = useSearchParams().get('id') ?? '';
  const vm = useArticleTranslationsPage(id);
  return <ArticleTranslationsPage {...vm} />;
}

export default function ArticleTranslationsRoute() {
  return (
    <Suspense>
      <ArticleTranslationsRouteContent />
    </Suspense>
  );
}
