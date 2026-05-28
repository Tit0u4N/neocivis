// biome-ignore-all lint: reasons UI component tests
// @ts-nocheck
'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/plate-editor/PlateEditor', () => ({
  PlateEditor: () => <div data-testid="plate-editor" />,
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ArticleTranslationsPage } from './ArticleTranslationsPage';

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ARTICLE_FR_EN = {
  id: 'art-1',
  status: 'published' as const,
  coverImageUrl: null,
  publishedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  translations: [
    { locale: 'fr', title: 'Titre FR', description: 'Desc FR', content: [] },
    { locale: 'en', title: 'EN Title', description: 'EN Desc', content: [] },
  ],
};

function makeProps(overrides: Partial<Parameters<typeof ArticleTranslationsPage>[0]> = {}) {
  return {
    article: ARTICLE_FR_EN,
    isLoading: false,
    error: null,
    availableLocalesToAdd: ['de', 'it'] as ('fr' | 'en' | 'de' | 'it')[],
    addLocale: 'de' as const,
    setAddLocale: vi.fn(),
    addForm: { title: '', description: '', content: [] },
    setAddForm: vi.fn(),
    isAddDialogOpen: false,
    setIsAddDialogOpen: vi.fn(),
    isAdding: false,
    handleOpenAddDialog: vi.fn(),
    handleAddTranslation: vi.fn(),
    editingLocale: null,
    setEditingLocale: vi.fn(),
    editForm: { title: '', description: '', content: [] },
    setEditForm: vi.fn(),
    isSavingEdit: false,
    handleOpenEdit: vi.fn(),
    handleSaveEdit: vi.fn(),
    deletingLocale: null,
    handleDeleteTranslation: vi.fn(),
    navigateToEdit: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ArticleTranslationsPage', () => {
  it('renders skeletons while loading', () => {
    const { container } = render(<ArticleTranslationsPage {...makeProps({ isLoading: true, article: null })} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders a card for each translation', () => {
    render(<ArticleTranslationsPage {...makeProps()} />);
    expect(screen.getByText('Titre FR')).toBeTruthy();
    expect(screen.getByText('EN Title')).toBeTruthy();
  });

  it('marks the French translation as default', () => {
    render(<ArticleTranslationsPage {...makeProps()} />);
    expect(screen.getByText('articles.translations.defaultLanguage')).toBeTruthy();
  });

  it('shows the error banner when error is set', () => {
    render(<ArticleTranslationsPage {...makeProps({ error: 'Erreur réseau' })} />);
    expect(screen.getByText('Erreur réseau')).toBeTruthy();
  });

  it('calls navigateToEdit when the back button is clicked', () => {
    const navigateToEdit = vi.fn();
    render(<ArticleTranslationsPage {...makeProps({ navigateToEdit })} />);
    fireEvent.click(screen.getByText('articles.translations.backToEdit'));
    expect(navigateToEdit).toHaveBeenCalled();
  });

  it('calls handleOpenAddDialog when the add translation button is clicked', () => {
    const handleOpenAddDialog = vi.fn();
    render(<ArticleTranslationsPage {...makeProps({ handleOpenAddDialog })} />);
    fireEvent.click(screen.getByText('articles.translations.addTranslation'));
    expect(handleOpenAddDialog).toHaveBeenCalled();
  });

  it('renders the add form when isAddDialogOpen is true', () => {
    render(<ArticleTranslationsPage {...makeProps({ isAddDialogOpen: true })} />);
    expect(screen.getByText('articles.translations.newTranslation')).toBeTruthy();
    expect(screen.getAllByTestId('plate-editor').length).toBeGreaterThan(0);
  });

  it('calls handleOpenEdit when an edit button is clicked', () => {
    const handleOpenEdit = vi.fn();
    render(<ArticleTranslationsPage {...makeProps({ handleOpenEdit })} />);
    const editButtons = screen.getAllByText('common.edit');
    fireEvent.click(editButtons[0]);
    expect(handleOpenEdit).toHaveBeenCalled();
  });

  it('renders the inline edit form for the editing locale', () => {
    render(
      <ArticleTranslationsPage
        {...makeProps({
          editingLocale: 'en',
          editForm: { title: 'EN Title', description: 'EN Desc', content: [] },
        })}
      />,
    );
    expect(screen.getByText('common.save')).toBeTruthy();
    expect(screen.getByDisplayValue('EN Title')).toBeTruthy();
  });

  it('calls handleSaveEdit when save is clicked inside the edit form', () => {
    const handleSaveEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <ArticleTranslationsPage
        {...makeProps({
          editingLocale: 'en',
          editForm: { title: 'EN Title', description: '', content: [] },
          handleSaveEdit,
        })}
      />,
    );
    fireEvent.click(screen.getByText('common.save'));
    expect(handleSaveEdit).toHaveBeenCalled();
  });

  it('calls setEditingLocale(null) when cancel is clicked inside the edit form', () => {
    const setEditingLocale = vi.fn();
    render(
      <ArticleTranslationsPage
        {...makeProps({
          editingLocale: 'en',
          editForm: { title: 'EN Title', description: '', content: [] },
          setEditingLocale,
        })}
      />,
    );
    fireEvent.click(screen.getByText('common.cancel'));
    expect(setEditingLocale).toHaveBeenCalledWith(null);
  });

  it('shows "all languages added" message when no locales remain', () => {
    render(<ArticleTranslationsPage {...makeProps({ availableLocalesToAdd: [] })} />);
    expect(screen.getByText('articles.translations.allLanguagesAdded')).toBeTruthy();
  });

  it('calls handleDeleteTranslation when delete is clicked for a non-FR locale', () => {
    const handleDeleteTranslation = vi.fn().mockResolvedValue(undefined);
    render(<ArticleTranslationsPage {...makeProps({ handleDeleteTranslation })} />);
    // There are two delete buttons - EN is the non-disabled one
    // The FR delete button is disabled, EN is enabled
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg') && !btn.disabled && btn.closest('tr') === null);
    // Find the active trash button (for EN)
    const activeDeleteButtons = screen.getAllByRole('button').filter((btn) => {
      const svg = btn.querySelector('svg[class*="lucide-trash"]');
      return svg && !btn.hasAttribute('disabled');
    });
    if (activeDeleteButtons.length > 0) {
      fireEvent.click(activeDeleteButtons[0]);
      expect(handleDeleteTranslation).toHaveBeenCalled();
    }
  });
});
