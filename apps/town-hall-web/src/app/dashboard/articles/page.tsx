// biome-ignore lint/style/noDefaultExport: Next.js page
'use client';

import { ArticleListPage } from '@/components/articles/ArticleListPage';
import { useArticleListPage } from '@/components/articles/useArticleListPage';

export default function ArticlesPage() {
  const vm = useArticleListPage();
  return <ArticleListPage {...vm} />;
}
