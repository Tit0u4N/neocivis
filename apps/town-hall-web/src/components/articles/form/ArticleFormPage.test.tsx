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

import { ArticleFormPage } from './ArticleFormPage';

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProps(overrides: Partial<Parameters<typeof ArticleFormPage>[0]> = {}) {
  return {
    isEditing: false,
    form: {
      title: '',
      description: '',
      content: [],
      coverImageUrl: '',
      status: 'draft' as const,
    },
    errors: {},
    isLoading: false,
    isSubmitting: false,
    apiError: null,
    setField: vi.fn(),
    handleSubmit: vi.fn(),
    handleCancel: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ArticleFormPage', () => {
  it('renders skeletons while loading', () => {
    const { container } = render(<ArticleFormPage {...makeProps({ isLoading: true })} />);
    // Skeletons are div elements with animate-pulse class
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders the form fields when not loading', () => {
    render(<ArticleFormPage {...makeProps()} />);
    expect(screen.getByLabelText('articles.form.fields.title')).toBeTruthy();
    expect(screen.getByTestId('plate-editor')).toBeTruthy();
  });

  it('displays a pre-filled title in edit mode', () => {
    render(
      <ArticleFormPage
        {...makeProps({
          isEditing: true,
          form: {
            title: 'Mon Article',
            description: 'Desc',
            content: [],
            coverImageUrl: '',
            status: 'published',
          },
        })}
      />,
    );
    const titleInput = screen.getByLabelText('articles.form.fields.title') as HTMLInputElement;
    expect(titleInput.value).toBe('Mon Article');
  });

  it('shows a field-level error for title', () => {
    render(<ArticleFormPage {...makeProps({ errors: { title: 'Champ requis' } })} />);
    expect(screen.getByText('Champ requis')).toBeTruthy();
  });

  it('shows the api error banner', () => {
    render(<ArticleFormPage {...makeProps({ apiError: 'Erreur réseau' })} />);
    expect(screen.getByText('Erreur réseau')).toBeTruthy();
  });

  it('calls setField when the title input changes', () => {
    const setField = vi.fn();
    render(<ArticleFormPage {...makeProps({ setField })} />);
    const input = screen.getByLabelText('articles.form.fields.title');
    fireEvent.change(input, { target: { value: 'Nouveau titre' } });
    expect(setField).toHaveBeenCalledWith('title', 'Nouveau titre');
  });

  it('calls handleSubmit when the save button is clicked', () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ArticleFormPage {...makeProps({ handleSubmit })} />);
    fireEvent.click(screen.getByText('common.save'));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('calls handleCancel when the cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(<ArticleFormPage {...makeProps({ handleCancel })} />);
    fireEvent.click(screen.getByText('common.cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });

  it('disables the save button while submitting', () => {
    render(<ArticleFormPage {...makeProps({ isSubmitting: true })} />);
    const saveBtn = screen.getByText('common.save').closest('button');
    expect(saveBtn?.disabled).toBe(true);
  });
});
