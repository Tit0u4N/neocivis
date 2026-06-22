// @ts-nocheck
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useArticlePreview } from './useArticlePreview';

function makeArticle(locales: string[] = ['fr']) {
  return {
    id: 'a1',
    status: 'published' as const,
    coverImageUrl: 'https://example.com/cover.jpg',
    publishedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    translations: locales.map((locale) => ({
      locale,
      title: `Titre en ${locale}`,
      description: `Description en ${locale}`,
      content: [],
    })),
  };
}

describe('useArticlePreview', () => {
  it('defaults to web view mode', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle()));
    expect(result.current.viewMode).toBe('web');
  });

  it('setViewMode switches to mobile', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle()));
    act(() => result.current.setViewMode('mobile'));
    expect(result.current.viewMode).toBe('mobile');
  });

  it('defaults locale to fr when fr translation exists', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle(['fr', 'en'])));
    expect(result.current.locale).toBe('fr');
  });

  it('returns the fr translation title', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle(['fr', 'en'])));
    expect(result.current.title).toBe('Titre en fr');
  });

  it('setLocale switches to another locale', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle(['fr', 'en'])));
    act(() => result.current.setLocale('en'));
    expect(result.current.locale).toBe('en');
    expect(result.current.title).toBe('Titre en en');
  });

  it('availableLocales lists all translation locales', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle(['fr', 'en', 'de'])));
    expect(result.current.availableLocales).toEqual(['fr', 'en', 'de']);
  });

  it('falls back to fr locale when article changes and current locale is missing', async () => {
    let article = makeArticle(['fr', 'en']);
    const { result, rerender } = renderHook(({ a }) => useArticlePreview(a), {
      initialProps: { a: article },
    });
    act(() => result.current.setLocale('en'));
    expect(result.current.locale).toBe('en');

    article = makeArticle(['fr']); // 'en' no longer available
    rerender({ a: article });

    await waitFor(() => expect(result.current.locale).toBe('fr'));
  });

  it('handles null article gracefully', () => {
    const { result } = renderHook(() => useArticlePreview(null));
    expect(result.current.title).toBe('');
    expect(result.current.status).toBe('draft');
    expect(result.current.availableLocales).toEqual(['fr']);
  });

  it('exposes coverImageUrl from article', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle()));
    expect(result.current.coverImageUrl).toBe('https://example.com/cover.jpg');
  });

  it('exposes article status', () => {
    const { result } = renderHook(() => useArticlePreview(makeArticle()));
    expect(result.current.status).toBe('published');
  });
});
