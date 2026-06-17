'use client';

import { ArticleListPage } from '../../../features/articles/list/ArticleListPage';
import { useArticleListPage } from '../../../features/articles/list/useArticleListPage';

export default function ArticlesPage() {
  const vm = useArticleListPage();
  return <ArticleListPage {...vm} />;
}
