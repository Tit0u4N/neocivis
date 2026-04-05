// biome-ignore lint/style/noDefaultExport: Next.js page
'use client';

import { use } from 'react';
import { ArticleFormPage } from '@/components/articles/ArticleFormPage';
import { useArticleFormPage } from '@/components/articles/useArticleFormPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditArticlePage({ params }: Props) {
  const { id } = use(params);
  const vm = useArticleFormPage(id);
  return <ArticleFormPage {...vm} />;
}
