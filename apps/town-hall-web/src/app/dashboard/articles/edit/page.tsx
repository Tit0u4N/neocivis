'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArticleFormPage } from '@/features/articles/form/ArticleFormPage';
import { useArticleFormPage } from '@/features/articles/form/useArticleFormPage';

/** L'identifiant est passé en query param (`?id=`) pour rester compatible avec l'export statique. */
function EditArticlePageContent() {
  const id = useSearchParams().get('id') ?? '';
  const vm = useArticleFormPage(id);
  return <ArticleFormPage {...vm} />;
}

export default function EditArticlePage() {
  return (
    <Suspense>
      <EditArticlePageContent />
    </Suspense>
  );
}
