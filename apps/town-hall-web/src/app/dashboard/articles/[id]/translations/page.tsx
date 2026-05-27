'use client';

import { use } from 'react';
import { ArticleTranslationsPage } from '../@/features/articles/translation/ArticleTranslationsPage';
import { useArticleTranslationsPage } from '../@/features/articles/translation/useArticleTranslationsPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ArticleTranslationsRoute({ params }: Props) {
  const { id } = use(params);
  const vm = useArticleTranslationsPage(id);
  return <ArticleTranslationsPage {...vm} />;
}
