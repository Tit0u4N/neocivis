'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockArticleService = {
  getById: vi.fn(),
  addTranslation: vi.fn(),
  updateTranslation: vi.fn(),
  deleteTranslation: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ articleService: mockArticleService }),
}));

import { useArticleTranslationsPage } from './useArticleTranslationsPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const ARTICLE_FR_ONLY = {
  id: 'art-1',
  status: 'published' as const,
  coverImageUrl: null,
  publishedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  translations: [
    {
      locale: 'fr',
      title: 'Titre FR',
      description: 'Description FR',
      content: [{ type: 'p', children: [{ text: 'Contenu' }] }],
    },
  ],
};

const ARTICLE_FR_EN = {
  ...ARTICLE_FR_ONLY,
  translations: [
    ...ARTICLE_FR_ONLY.translations,
    {
      locale: 'en',
      title: 'EN Title',
      description: 'EN Description',
      content: [{ type: 'p', children: [{ text: 'Content' }] }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useArticleTranslationsPage', () => {
  it('loads the article on mount', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_ONLY);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.article).toEqual(ARTICLE_FR_ONLY);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getById throws', async () => {
    mockArticleService.getById.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });

  it('availableLocalesToAdd lists locales not yet present', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_ONLY);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // French is present; en, de, it should be available
    expect(result.current.availableLocalesToAdd).toEqual(expect.arrayContaining(['en', 'de', 'it']));
    expect(result.current.availableLocalesToAdd).not.toContain('fr');
  });

  it('availableLocalesToAdd excludes all locales once all are added', async () => {
    const fullArticle = {
      ...ARTICLE_FR_ONLY,
      translations: ['fr', 'en', 'de', 'it'].map((locale) => ({
        locale,
        title: `Title ${locale}`,
        description: '',
        content: [],
      })),
    };
    mockArticleService.getById.mockResolvedValue(fullArticle);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.availableLocalesToAdd).toHaveLength(0);
  });

  it('handleOpenAddDialog opens the dialog and pre-selects the first available locale', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_EN);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleOpenAddDialog());

    expect(result.current.isAddDialogOpen).toBe(true);
    // fr and en are present; de should be the first available
    expect(result.current.addLocale).toBe('de');
  });

  it('handleAddTranslation calls addTranslation then refreshes', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_ONLY);
    mockArticleService.addTranslation.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setAddLocale('en');
      result.current.setAddForm({ title: 'EN Title', description: 'EN Desc', content: [] });
      result.current.setIsAddDialogOpen(true);
    });

    await act(async () => {
      await result.current.handleAddTranslation();
    });

    expect(mockArticleService.addTranslation).toHaveBeenCalledWith(
      'art-1',
      expect.objectContaining({ locale: 'en', title: 'EN Title' }),
    );
    // Refreshes the article
    expect(mockArticleService.getById).toHaveBeenCalledTimes(2);
    expect(result.current.isAddDialogOpen).toBe(false);
  });

  it('handleAddTranslation sets error when service throws', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_ONLY);
    mockArticleService.addTranslation.mockRejectedValue(new Error('Conflict'));
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setIsAddDialogOpen(true));
    await act(async () => {
      await result.current.handleAddTranslation();
    });

    expect(result.current.error).not.toBeNull();
  });

  it('handleOpenEdit populates the edit form with existing translation data', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_EN);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleOpenEdit('en'));

    expect(result.current.editingLocale).toBe('en');
    expect(result.current.editForm.title).toBe('EN Title');
    expect(result.current.editForm.description).toBe('EN Description');
  });

  it('handleSaveEdit calls updateTranslation and clears the edit state', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_EN);
    mockArticleService.updateTranslation.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleOpenEdit('en');
      result.current.setEditForm({ title: 'Updated EN', description: '', content: [] });
    });

    await act(async () => {
      await result.current.handleSaveEdit();
    });

    expect(mockArticleService.updateTranslation).toHaveBeenCalledWith(
      'art-1',
      'en',
      expect.objectContaining({ title: 'Updated EN' }),
    );
    expect(result.current.editingLocale).toBeNull();
  });

  it('handleDeleteTranslation calls deleteTranslation then refreshes', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_EN);
    mockArticleService.deleteTranslation.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleDeleteTranslation('en');
    });

    expect(mockArticleService.deleteTranslation).toHaveBeenCalledWith('art-1', 'en');
    expect(mockArticleService.getById).toHaveBeenCalledTimes(2);
    expect(result.current.deletingLocale).toBeNull();
  });

  it('handleDeleteTranslation sets error when service throws', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_EN);
    mockArticleService.deleteTranslation.mockRejectedValue(new Error('Forbidden'));
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleDeleteTranslation('en');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.deletingLocale).toBeNull();
  });

  it('navigateToEdit pushes to the article edit page', async () => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_FR_ONLY);
    const { result } = renderHook(() => useArticleTranslationsPage('art-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.navigateToEdit());
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/art-1');
  });
});
