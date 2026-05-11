'use client';

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useEstablishmentListPage } from './useEstablishmentListPage';

afterEach(() => {
  vi.clearAllMocks();
});

describe('useEstablishmentListPage', () => {
  it('exposes initial mock data on mount', () => {
    const { result } = renderHook(() => useEstablishmentListPage());
    expect(result.current.establishments.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('filters by type "mairie"', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.setTypeFilter('mairie');
    });

    expect(result.current.establishments.every((e) => e.type === 'mairie')).toBe(true);
  });

  it('filters by type "education"', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.setTypeFilter('education');
    });

    expect(result.current.establishments.every((e) => e.type === 'education')).toBe(true);
  });

  it('filters by search query (case-insensitive)', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.setSearchQuery('MAIRIE');
    });

    expect(result.current.establishments.every((e) => e.name.toLowerCase().includes('mairie'))).toBe(true);
  });

  it('combines type filter and search query', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.setTypeFilter('culture');
      result.current.setSearchQuery('médiathèque');
    });

    expect(result.current.establishments).toHaveLength(1);
    expect(result.current.establishments[0].type).toBe('culture');
  });

  it('returns no results when filters do not match', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.setSearchQuery('zzzz-no-match-zzzz');
    });

    expect(result.current.establishments).toHaveLength(0);
  });

  it('handleDelete removes the establishment from the list', () => {
    const { result } = renderHook(() => useEstablishmentListPage());
    const initialCount = result.current.establishments.length;
    const targetId = result.current.establishments[0].id;

    act(() => {
      result.current.handleDelete(targetId);
    });

    expect(result.current.establishments).toHaveLength(initialCount - 1);
    expect(result.current.establishments.find((e) => e.id === targetId)).toBeUndefined();
    expect(result.current.confirmDeleteId).toBeNull();
    expect(result.current.deletingId).toBeNull();
  });

  it('navigateToCreate pushes /dashboard/establishment/new', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.navigateToCreate();
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment/new');
  });

  it('navigateToEdit pushes the establishment edit URL', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.navigateToEdit('est-1');
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment/est-1');
  });

  it('setConfirmDeleteId sets and clears the dialog state', () => {
    const { result } = renderHook(() => useEstablishmentListPage());

    act(() => {
      result.current.setConfirmDeleteId('est-1');
    });
    expect(result.current.confirmDeleteId).toBe('est-1');

    act(() => {
      result.current.setConfirmDeleteId(null);
    });
    expect(result.current.confirmDeleteId).toBeNull();
  });
});
