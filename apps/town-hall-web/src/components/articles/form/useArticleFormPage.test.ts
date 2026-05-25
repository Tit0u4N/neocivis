//@ts-nocheck

'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/providers/ServicesProvider', async () => {
  const { mockArticleService: instance } = await import('@repo/frontend-services/testing');
  return {
    useServices: () => ({ article: instance }),
  };
});

import { mockArticleService } from '@repo/frontend-services/testing';

import { useArticleFormPage } from './useArticleFormPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ARTICLE_STUB = {
  id: 'article-1',
  status: 'draft' as const,
  coverImageUrl: 'https://example.com/img.jpg',
  publishedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  translations: [
    {
      locale: 'fr',
      title: 'Mon Article',
      description: 'Description test',
      content: [{ type: 'p', children: [{ text: 'Hello' }] }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Create mode
// ---------------------------------------------------------------------------

describe('useArticleFormPage — create mode', () => {
  it('initialises with an empty form and isLoading=false', () => {
    const { result } = renderHook(() => useArticleFormPage());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.title).toBe('');
    expect(result.current.form.status).toBe('draft');
    expect(result.current.apiError).toBeNull();
  });

  it('setField updates the form field and clears its error', async () => {
    const { result } = renderHook(() => useArticleFormPage());
    // Trigger a validation error first
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.errors.title).toBeDefined();

    act(() => result.current.setField('title', 'Nouveau titre'));

    expect(result.current.form.title).toBe('Nouveau titre');
    expect(result.current.errors.title).toBeUndefined();
  });

  it('handleSubmit blocks when title is empty and sets an error', async () => {
    const { result } = renderHook(() => useArticleFormPage());
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(mockArticleService.create).not.toHaveBeenCalled();
    expect(result.current.errors.title).toBeDefined();
  });

  it('handleSubmit calls articleService.create with the correct payload', async () => {
    mockArticleService.create.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleFormPage());

    act(() => {
      result.current.setField('title', 'Mon titre');
      result.current.setField('content', [{ type: 'p', children: [{ text: 'Body' }] }]);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockArticleService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        translation: expect.objectContaining({ locale: 'fr', title: 'Mon titre' }),
      }),
    );
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles');
  });

  it('handleSubmit sets apiError when create throws', async () => {
    mockArticleService.create.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useArticleFormPage());

    act(() => result.current.setField('title', 'Titre'));
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.apiError).not.toBeNull();
  });

  it('isDirty starts false and becomes true after setField', () => {
    const { result } = renderHook(() => useArticleFormPage());
    expect(result.current.isDirty).toBe(false);
    act(() => result.current.setField('title', 'Hello'));
    expect(result.current.isDirty).toBe(true);
  });

  it('handleCancel navigates directly when form is clean', () => {
    const { result } = renderHook(() => useArticleFormPage());
    act(() => result.current.handleCancel());
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles');
    expect(result.current.showDiscardDialog).toBe(false);
  });

  it('handleCancel opens the discard dialog when form is dirty', () => {
    const { result } = renderHook(() => useArticleFormPage());
    act(() => result.current.setField('title', 'Changed'));
    act(() => result.current.handleCancel());
    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.showDiscardDialog).toBe(true);
  });

  it('handleBack opens the discard dialog when form is dirty', () => {
    const { result } = renderHook(() => useArticleFormPage());
    act(() => result.current.setField('title', 'Changed'));
    act(() => result.current.handleBack());
    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.showDiscardDialog).toBe(true);
  });

  it('confirmDiscard navigates away and closes the dialog', () => {
    const { result } = renderHook(() => useArticleFormPage());
    act(() => result.current.setField('title', 'Changed'));
    act(() => result.current.handleCancel());
    act(() => result.current.confirmDiscard());
    expect(result.current.showDiscardDialog).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles');
  });

  it('closeDiscardDialog closes the dialog without navigating', () => {
    const { result } = renderHook(() => useArticleFormPage());
    act(() => result.current.setField('title', 'Changed'));
    act(() => result.current.handleCancel());
    act(() => result.current.closeDiscardDialog());
    expect(result.current.showDiscardDialog).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('isDirty resets to false after a successful submit', async () => {
    mockArticleService.create.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleFormPage());
    act(() => result.current.setField('title', 'Mon titre'));
    expect(result.current.isDirty).toBe(true);
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.isDirty).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Edit mode
// ---------------------------------------------------------------------------

describe('useArticleFormPage — edit mode', () => {
  beforeEach(() => {
    mockArticleService.getById.mockResolvedValue(ARTICLE_STUB);
  });

  it('starts with isLoading=true then populates the form', async () => {
    const { result } = renderHook(() => useArticleFormPage('article-1'));
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isEditing).toBe(true);
    expect(result.current.form.title).toBe('Mon Article');
    expect(result.current.form.description).toBe('Description test');
    expect(result.current.form.coverImageUrl).toBe('https://example.com/img.jpg');
    expect(result.current.form.status).toBe('draft');
  });

  it('handleSubmit calls articleService.update with the correct id', async () => {
    mockArticleService.update.mockResolvedValue(undefined);
    const { result } = renderHook(() => useArticleFormPage('article-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockArticleService.update).toHaveBeenCalledWith(
      'article-1',
      expect.objectContaining({
        translation: expect.objectContaining({ locale: 'fr', title: 'Mon Article' }),
      }),
    );
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles');
  });

  it('sets apiError when getById throws', async () => {
    mockArticleService.getById.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useArticleFormPage('article-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.apiError).not.toBeNull();
  });
});
