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

vi.mock('@/providers/ApiProvider', () => ({
  useApi: () => ({}),
}));

const mockEstablishmentService = {
  getAll: vi.fn(),
  delete: vi.fn(),
};
vi.mock('@repo/frontend-services/establishment', () => ({
  EstablishmentService: vi.fn(function (this: any) {
    return mockEstablishmentService;
  }),
}));

import { useEstablishmentListPage } from './useEstablishmentListPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeEstablishment(id: string, type: 'mairie' | 'education' | 'culture' | 'sport', name: string) {
  return { id, name, type, address: '1 rue de la Paix', hours: 'Lun-Ven 9h-17h', phone: '01 02 03 04 05' };
}

const ESTABLISHMENTS = [
  makeEstablishment('est-1', 'mairie', 'Mairie principale'),
  makeEstablishment('est-2', 'education', 'École Jules Ferry'),
  makeEstablishment('est-3', 'culture', 'Médiathèque municipale'),
  makeEstablishment('est-4', 'sport', 'Stade municipal'),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useEstablishmentListPage', () => {
  it('loads establishments on mount and clears loading state', async () => {
    mockEstablishmentService.getAll.mockResolvedValue(ESTABLISHMENTS);
    const { result } = renderHook(() => useEstablishmentListPage());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.establishments).toHaveLength(4);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getAll throws', async () => {
    mockEstablishmentService.getAll.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });

  it('filters by type "mairie"', async () => {
    mockEstablishmentService.getAll.mockResolvedValue(ESTABLISHMENTS);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTypeFilter('mairie'));

    expect(result.current.establishments.every((e) => e.type === 'mairie')).toBe(true);
  });

  it('filters by type "education"', async () => {
    mockEstablishmentService.getAll.mockResolvedValue(ESTABLISHMENTS);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTypeFilter('education'));

    expect(result.current.establishments.every((e) => e.type === 'education')).toBe(true);
  });

  it('filters by search query (case-insensitive)', async () => {
    mockEstablishmentService.getAll.mockResolvedValue(ESTABLISHMENTS);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearchQuery('MAIRIE'));

    expect(result.current.establishments.every((e) => e.name.toLowerCase().includes('mairie'))).toBe(true);
  });

  it('combines type filter and search query', async () => {
    mockEstablishmentService.getAll.mockResolvedValue(ESTABLISHMENTS);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setTypeFilter('culture');
      result.current.setSearchQuery('médiathèque');
    });

    expect(result.current.establishments).toHaveLength(1);
    expect(result.current.establishments[0].type).toBe('culture');
  });

  it('handleDelete calls service.delete then refreshes the list', async () => {
    mockEstablishmentService.getAll.mockResolvedValue(ESTABLISHMENTS);
    mockEstablishmentService.delete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleDelete('est-1');
    });

    expect(mockEstablishmentService.delete).toHaveBeenCalledWith('est-1');
    expect(mockEstablishmentService.getAll).toHaveBeenCalledTimes(2);
    expect(result.current.confirmDeleteId).toBeNull();
    expect(result.current.deletingId).toBeNull();
  });

  it('navigateToCreate pushes /dashboard/establishment/new', async () => {
    mockEstablishmentService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.navigateToCreate());
    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment/new');
  });

  it('navigateToEdit pushes the establishment edit URL', async () => {
    mockEstablishmentService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.navigateToEdit('est-1'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment/est-1');
  });

  it('setConfirmDeleteId sets and clears the dialog state', async () => {
    mockEstablishmentService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => useEstablishmentListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setConfirmDeleteId('est-1'));
    expect(result.current.confirmDeleteId).toBe('est-1');

    act(() => result.current.setConfirmDeleteId(null));
    expect(result.current.confirmDeleteId).toBeNull();
  });
});
