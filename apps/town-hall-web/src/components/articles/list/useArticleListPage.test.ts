// @ts-nocheck

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
  getAll: vi.fn(),
  delete: vi.fn(),
  updateStatus: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ articleService: mockArticleService }),
}));

import { useArticleListPage } from './useArticleListPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeArticle(id: string, status: 'draft' | 'published', frTitle: string) {
  return {
    id,
    status,
    coverImageUrl: null,
    publishedAt: status === 'published' ? '2024-06-01T00:00:00Z' : null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    translations: [{ locale: 'fr', title: frTitle, description: '', content: [] }],
  };
}

const ARTICLES = [
  makeArticle('a1', 'published', 'Premier article'),
  makeArticle('a2', 'draft', 'Deuxième article'),
  makeArticle('a3', 'published', 'Troisième article'),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useArticleListPage', () => {
  it('loads articles on mount and clears loading state', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    const { result } = renderHook(() => useArticleListPage());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.articles).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getAll throws', async () => {
    mockArticleService.getAll.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });

  it('filteredArticles filters by status "published"', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStatusFilter('published'));

    expect(result.current.articles.every((a) => a.status === 'published')).toBe(true);
    expect(result.current.articles).toHaveLength(2);
  });

  it('filteredArticles filters by status "draft"', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStatusFilter('draft'));

    expect(result.current.articles).toHaveLength(1);
    expect(result.current.articles[0].id).toBe('a2');
  });

  it('filteredArticles filters by search query (case-insensitive)', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearchQuery('TROISIÈME'));

    expect(result.current.articles).toHaveLength(1);
    expect(result.current.articles[0].id).toBe('a3');
  });

  it('filteredArticles applies both status and search filters together', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setStatusFilter('published');
      result.current.setSearchQuery('premier');
    });

    expect(result.current.articles).toHaveLength(1);
    expect(result.current.articles[0].id).toBe('a1');
  });

  it('handleDelete calls articleService.delete then refreshes the list', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    mockArticleService.delete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleDelete('a1');
    });

    expect(mockArticleService.delete).toHaveBeenCalledWith('a1');
    expect(mockArticleService.getAll).toHaveBeenCalledTimes(2);
    expect(result.current.confirmDeleteId).toBeNull();
    expect(result.current.deletingId).toBeNull();
  });

  it('handleDelete sets error when delete throws', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    mockArticleService.delete.mockRejectedValue(new Error('Forbidden'));
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleDelete('a1');
    });

    expect(result.current.error).not.toBeNull();
  });

  it('handleToggleStatus publishes a draft article', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    mockArticleService.updateStatus.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const draft = ARTICLES[1]; // a2 — status: 'draft'
    await act(async () => {
      await result.current.handleToggleStatus(draft);
    });

    expect(mockArticleService.updateStatus).toHaveBeenCalledWith('a2', { status: 'published' });
  });

  it('handleToggleStatus unpublishes a published article', async () => {
    mockArticleService.getAll.mockResolvedValue(ARTICLES);
    mockArticleService.updateStatus.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const published = ARTICLES[0]; // a1 — status: 'published'
    await act(async () => {
      await result.current.handleToggleStatus(published);
    });

    expect(mockArticleService.updateStatus).toHaveBeenCalledWith('a1', { status: 'draft' });
  });

  it('navigateToCreate pushes /dashboard/articles/new', async () => {
    mockArticleService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.navigateToCreate());
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/new');
  });

  it('navigateToEdit pushes the article edit URL', async () => {
    mockArticleService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.navigateToEdit('a1'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/a1');
  });

  it('navigateToTranslations pushes the translations URL', async () => {
    mockArticleService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => useArticleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.navigateToTranslations('a1'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/a1/translations');
  });
});
