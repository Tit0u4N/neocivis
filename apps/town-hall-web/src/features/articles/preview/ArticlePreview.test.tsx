// @ts-nocheck

'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/plate-editor/PlateEditor', () => ({
  PlateEditor: () => <div data-testid="plate-editor" />,
}));

import { ArticlePreview } from './ArticlePreview';

afterEach(cleanup);

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    article: {
      id: 'a1',
      status: 'published',
      coverImageUrl: null,
      publishedAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      translations: [{ locale: 'fr', title: 'Mon article', description: 'Desc', content: [] }],
    },
    title: 'Mon article',
    description: 'Desc',
    content: [],
    coverImageUrl: '',
    status: 'published' as const,
    viewMode: 'web' as const,
    setViewMode: vi.fn(),
    locale: 'fr' as const,
    setLocale: vi.fn(),
    availableLocales: ['fr' as const],
    onBack: vi.fn(),
    onEdit: vi.fn(),
    ...overrides,
  };
}

describe('ArticlePreview', () => {
  it('renders the article title', () => {
    render(<ArticlePreview {...makeProps()} />);
    expect(screen.getByText('Mon article')).toBeTruthy();
  });

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn();
    render(<ArticlePreview {...makeProps({ onBack })} />);
    fireEvent.click(screen.getByText('Retour'));
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onEdit when the edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ArticlePreview {...makeProps({ onEdit })} />);
    fireEvent.click(screen.getByText('Modifier'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls setViewMode with mobile when mobile tab is clicked', () => {
    const setViewMode = vi.fn();
    render(<ArticlePreview {...makeProps({ setViewMode })} />);
    fireEvent.click(screen.getByText('Vue mobile'));
    expect(setViewMode).toHaveBeenCalledWith('mobile');
  });

  it('calls setViewMode with web when web tab is clicked', () => {
    const setViewMode = vi.fn();
    render(<ArticlePreview {...makeProps({ viewMode: 'mobile', setViewMode })} />);
    fireEvent.click(screen.getByText('Vue web'));
    expect(setViewMode).toHaveBeenCalledWith('web');
  });

  it('renders the plate editor in web view', () => {
    render(<ArticlePreview {...makeProps({ viewMode: 'web' })} />);
    expect(screen.getByTestId('plate-editor')).toBeTruthy();
  });

  it('shows the published badge when status is published', () => {
    render(<ArticlePreview {...makeProps({ status: 'published' })} />);
    expect(screen.getByText('Publié')).toBeTruthy();
  });

  it('shows the draft badge when status is draft', () => {
    render(<ArticlePreview {...makeProps({ status: 'draft' })} />);
    expect(screen.getByText('Brouillon')).toBeTruthy();
  });
});
