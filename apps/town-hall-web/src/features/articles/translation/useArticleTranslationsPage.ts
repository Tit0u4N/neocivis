'use client';

import type { AddTranslationInput, Article, ArticleLocale } from '@repo/contracts/article';
import { useServices } from 'apps/town-hall-web/src/providers/ServicesProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const ALL_LOCALES: ArticleLocale[] = ['fr', 'en', 'de', 'it'];

type TranslationFormState = {
  locale: ArticleLocale;
  title: string;
  description: string;
  content: unknown;
};

const DEFAULT_TRANSLATION_FORM: Omit<TranslationFormState, 'locale'> = {
  title: '',
  description: '',
  content: [],
};

export function useArticleTranslationsPage(id: string) {
  const router = useRouter();
  const { articleService } = useServices();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [addLocale, setAddLocale] = useState<ArticleLocale>('en');
  const [addForm, setAddForm] = useState<Omit<TranslationFormState, 'locale'>>(DEFAULT_TRANSLATION_FORM);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Edit form
  const [editingLocale, setEditingLocale] = useState<ArticleLocale | null>(null);
  const [editForm, setEditForm] = useState<Omit<TranslationFormState, 'locale'>>(DEFAULT_TRANSLATION_FORM);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete
  const [deletingLocale, setDeletingLocale] = useState<ArticleLocale | null>(null);

  const fetchArticle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await articleService.getById(id);
      setArticle(data);
    } catch {
      setError('Impossible de charger cet article.');
    } finally {
      setIsLoading(false);
    }
  }, [id, articleService.getById]);

  useEffect(() => {
    void fetchArticle();
  }, [fetchArticle]);

  const availableLocalesToAdd = article
    ? ALL_LOCALES.filter((l) => !article.translations.some((t) => t.locale === l))
    : [];

  const handleOpenAddDialog = useCallback(() => {
    const firstAvailable = availableLocalesToAdd[0];
    if (firstAvailable) {
      setAddLocale(firstAvailable);
    }
    setAddForm(DEFAULT_TRANSLATION_FORM);
    setIsAddDialogOpen(true);
  }, [availableLocalesToAdd]);

  const handleAddTranslation = useCallback(async () => {
    setIsAdding(true);
    setError(null);
    try {
      const input: AddTranslationInput = {
        locale: addLocale,
        title: addForm.title,
        description: addForm.description || undefined,
        content: addForm.content as unknown[],
      };
      await articleService.addTranslation(id, input);
      await fetchArticle();
      setIsAddDialogOpen(false);
      setAddForm(DEFAULT_TRANSLATION_FORM);
    } catch {
      setError("Impossible d'ajouter la traduction.");
    } finally {
      setIsAdding(false);
    }
  }, [id, addLocale, addForm, fetchArticle, articleService.addTranslation]);

  const handleOpenEdit = useCallback(
    (locale: ArticleLocale) => {
      if (!article) {
        return;
      }
      const translation = article.translations.find((t) => t.locale === locale);
      if (!translation) {
        return;
      }
      setEditingLocale(locale);
      setEditForm({
        title: translation.title,
        description: translation.description ?? '',
        content: (translation.content as unknown as unknown[]) ?? [],
      });
    },
    [article],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editingLocale) {
      return;
    }
    setIsSavingEdit(true);
    setError(null);
    try {
      await articleService.updateTranslation(id, editingLocale, {
        title: editForm.title,
        description: editForm.description || undefined,
        content: editForm.content as unknown[],
      });
      await fetchArticle();
      setEditingLocale(null);
    } catch {
      setError('Impossible de sauvegarder la traduction.');
    } finally {
      setIsSavingEdit(false);
    }
  }, [id, editingLocale, editForm, fetchArticle, articleService.updateTranslation]);

  const handleDeleteTranslation = useCallback(
    async (locale: ArticleLocale) => {
      setDeletingLocale(locale);
      setError(null);
      try {
        await articleService.deleteTranslation(id, locale);
        await fetchArticle();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Impossible de supprimer la traduction.';
        setError(message);
      } finally {
        setDeletingLocale(null);
      }
    },
    [id, fetchArticle, articleService.deleteTranslation],
  );

  const navigateToEdit = useCallback(() => {
    router.push(`/dashboard/articles/${id}`);
  }, [id, router]);

  return {
    article,
    isLoading,
    error,
    availableLocalesToAdd,
    // Add dialog
    addLocale,
    setAddLocale,
    addForm,
    setAddForm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isAdding,
    handleOpenAddDialog,
    handleAddTranslation,
    // Edit
    editingLocale,
    setEditingLocale,
    editForm,
    setEditForm,
    isSavingEdit,
    handleOpenEdit,
    handleSaveEdit,
    // Delete
    deletingLocale,
    handleDeleteTranslation,
    // Navigation
    navigateToEdit,
  };
}
