'use client';

import { ArticleFormPage } from '@/features/articles/form/ArticleFormPage';
import { useArticleFormPage } from '@/features/articles/form/useArticleFormPage';

export default function NewArticlePage() {
  const vm = useArticleFormPage();
  return <ArticleFormPage {...vm} />;
}
