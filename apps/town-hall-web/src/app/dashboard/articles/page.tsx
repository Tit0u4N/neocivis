// biome-ignore lint/style/noDefaultExport: Next.js page
'use client';

import { ArticleListPage } from '@/components/articles/list/ArticleListPage';
import { useArticleListPage } from '@/components/articles/list/useArticleListPage';

export default function ArticlesPage() {
  const vm = useArticleListPage();
  return <ArticleListPage {...vm} />;
}
