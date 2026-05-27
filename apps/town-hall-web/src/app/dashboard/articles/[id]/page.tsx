'use client';

import { use } from 'react';
import { ArticleFormPage } from '../../../../features/articles/form/ArticleFormPage';
import { useArticleFormPage } from '../../../../features/articles/form/useArticleFormPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditArticlePage({ params }: Props) {
  const { id } = use(params);
  const vm = useArticleFormPage(id);
  return <ArticleFormPage {...vm} />;
}
