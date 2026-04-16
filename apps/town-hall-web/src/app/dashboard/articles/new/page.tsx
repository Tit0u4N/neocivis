'use client';

import { ArticleFormPage } from '@/components/articles/form/ArticleFormPage';
import { useArticleFormPage } from '@/components/articles/form/useArticleFormPage';

export default function NewArticlePage() {
  const vm = useArticleFormPage();
  return <ArticleFormPage {...vm} />;
}
