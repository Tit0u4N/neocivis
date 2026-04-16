// biome-ignore lint/style/noDefaultExport: Next.js page
'use client';

import { use } from 'react';
import { ArticleTranslationsPage } from '@/components/articles/translation/ArticleTranslationsPage';
import { useArticleTranslationsPage } from '@/components/articles/translation/useArticleTranslationsPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ArticleTranslationsRoute({ params }: Props) {
  const { id } = use(params);
  const vm = useArticleTranslationsPage(id);
  return <ArticleTranslationsPage {...vm} />;
}
