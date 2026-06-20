// @ts-nocheck

'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ArticleListPage } from './ArticleListPage';

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeArticle(id: string, status: 'draft' | 'published', frTitle: string) {
  return {
    id,
    status,
    coverImageUrl: null,
    publishedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    translations: [{ locale: 'fr', title: frTitle, description: '', content: [] }],
  };
}

function makeProps(overrides: Partial<Parameters<typeof ArticleListPage>[0]> = {}) {
  return {
    articles: [],
    isLoading: false,
    error: null,
    statusFilter: 'all' as const,
    setStatusFilter: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    deletingId: null,
    confirmDeleteId: null,
    setConfirmDeleteId: vi.fn(),
    handleDelete: vi.fn(),
    handleToggleStatus: vi.fn(),
    navigateToCreate: vi.fn(),
    navigateToEdit: vi.fn(),
    navigateToTranslations: vi.fn(),
    viewMode: 'list' as const,
    setViewMode: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ArticleListPage', () => {
  it('renders skeleton rows while loading', () => {
    const { container } = render(<ArticleListPage {...makeProps({ isLoading: true })} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no articles', () => {
    render(<ArticleListPage {...makeProps({ isLoading: false, articles: [] })} />);
    expect(screen.getByText('articles.list.empty.title')).toBeTruthy();
  });

  it('renders a row for each article', () => {
    const articles = [makeArticle('a1', 'published', 'Article Un'), makeArticle('a2', 'draft', 'Article Deux')];
    render(<ArticleListPage {...makeProps({ articles })} />);
    expect(screen.getByText('Article Un')).toBeTruthy();
    expect(screen.getByText('Article Deux')).toBeTruthy();
  });

  it('shows the error banner when error is set', () => {
    render(<ArticleListPage {...makeProps({ error: 'Erreur de chargement' })} />);
    expect(screen.getByText('Erreur de chargement')).toBeTruthy();
  });

  it('calls navigateToCreate when the new article button is clicked', () => {
    const navigateToCreate = vi.fn();
    render(<ArticleListPage {...makeProps({ navigateToCreate })} />);
    fireEvent.click(screen.getByText('articles.list.newArticle'));
    expect(navigateToCreate).toHaveBeenCalled();
  });

  it('calls setSearchQuery when the search input changes', () => {
    const setSearchQuery = vi.fn();
    render(<ArticleListPage {...makeProps({ setSearchQuery })} />);
    const input = screen.getByPlaceholderText('articles.list.filters.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('shows the delete confirmation dialog when confirmDeleteId is set', () => {
    render(<ArticleListPage {...makeProps({ confirmDeleteId: 'a1' })} />);
    expect(screen.getByText('articles.list.deleteDialog.title')).toBeTruthy();
  });

  it('calls handleDelete when the delete confirmation is confirmed', () => {
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(<ArticleListPage {...makeProps({ confirmDeleteId: 'a1', handleDelete })} />);
    fireEvent.click(screen.getByText('common.delete'));
    expect(handleDelete).toHaveBeenCalledWith('a1');
  });

  it('calls setConfirmDeleteId(null) when the dialog is cancelled', () => {
    const setConfirmDeleteId = vi.fn();
    render(<ArticleListPage {...makeProps({ confirmDeleteId: 'a1', setConfirmDeleteId })} />);
    fireEvent.click(screen.getByText('common.cancel'));
    expect(setConfirmDeleteId).toHaveBeenCalledWith(null);
  });

  it('renders article cards in grid view', () => {
    const articles = [makeArticle('a1', 'published', 'Article Un'), makeArticle('a2', 'draft', 'Article Deux')];
    render(<ArticleListPage {...makeProps({ articles, viewMode: 'grid' })} />);
    expect(screen.getByText('Article Un')).toBeTruthy();
    expect(screen.getByText('Article Deux')).toBeTruthy();
  });

  it('shows empty state in grid view when there are no articles', () => {
    render(<ArticleListPage {...makeProps({ isLoading: false, articles: [], viewMode: 'grid' })} />);
    expect(screen.getByText('articles.list.empty.title')).toBeTruthy();
  });

  it('renders grid skeletons while loading in grid view', () => {
    const { container } = render(<ArticleListPage {...makeProps({ isLoading: true, viewMode: 'grid' })} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
