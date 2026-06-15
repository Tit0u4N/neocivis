'use client';

import type { Article, ArticleStatus } from '@repo/contracts/article';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useArticlePreview } from '@/features/articles/preview/useArticlePreview';
import { useServices } from '@/providers/ServicesProvider';

type StatusFilter = ArticleStatus | 'all';
type ViewMode = 'list' | 'grid';

export function useArticleListPage() {
  const router = useRouter();
  const { articleService } = useServices();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSelectArticle = useCallback((article: Article) => {
    setSelectedArticle((prev) => (prev?.id === article.id ? null : article));
  }, []);

  const handleClosePreview = useCallback(() => setSelectedArticle(null), []);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await articleService.getAll();
      setArticles(data);
    } catch {
      setError('Impossible de charger les articles.');
    } finally {
      setIsLoading(false);
    }
  }, [articleService.getAll]);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      const frTitle = article.translations.find((t) => t.locale === 'fr')?.title ?? '';
      const matchesSearch = frTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [articles, statusFilter, searchQuery]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await articleService.delete(id);
        await fetchArticles();
      } catch {
        setError('Impossible de supprimer cet article.');
      } finally {
        setDeletingId(null);
        setConfirmDeleteId(null);
      }
    },
    [fetchArticles, articleService.delete],
  );

  const handleToggleStatus = useCallback(
    async (article: Article) => {
      const newStatus: ArticleStatus = article.status === 'published' ? 'draft' : 'published';
      try {
        await articleService.updateStatus(article.id, { status: newStatus });
        await fetchArticles();
      } catch {
        setError('Impossible de modifier le statut.');
      }
    },
    [fetchArticles, articleService.updateStatus],
  );

  const navigateToCreate = useCallback(() => {
    router.push('/dashboard/articles/new');
  }, [router]);

  const navigateToEdit = useCallback(
    (id: string) => {
      router.push(`/dashboard/articles/${id}`);
    },
    [router],
  );

  const navigateToTranslations = useCallback(
    (id: string) => {
      router.push(`/dashboard/articles/${id}/translations`);
    },
    [router],
  );

  const preview = useArticlePreview(selectedArticle);

  return {
    articles: filteredArticles,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    deletingId,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    handleToggleStatus,
    navigateToCreate,
    navigateToEdit,
    navigateToTranslations,
    selectedArticle,
    handleSelectArticle,
    handleClosePreview,
    preview,
    viewMode,
    setViewMode,
  };
}
