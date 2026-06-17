'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/providers/ServicesProvider');
vi.mock('@/stores/city.store');

import { useServices } from '@/providers/ServicesProvider';
import { useCityStore } from '@/stores/city.store';
import { useUserListPage } from './useUserListPage';

const CITY_ID = 'NCE_06000';
const alice = { id: 1, username: 'alice', firstName: 'Alice', lastName: 'Martin', profilePictureUrl: null };
const bob = { id: 2, username: 'bob', firstName: 'Bob', lastName: 'Dupont', profilePictureUrl: null };
const mockRole = { id: 'r1', name: 'Modérateur', description: '', permissions: [] };

function buildServices(overrides: Record<string, unknown> = {}) {
  return {
    cityService: {
      listEmployees: vi.fn().mockResolvedValue([alice, bob]),
      createAndAssignEmployee: vi.fn().mockResolvedValue({ ok: true }),
      unassignEmployee: vi.fn().mockResolvedValue({ ok: true }),
      ...overrides,
    },
    accessService: {
      listRoles: vi.fn().mockResolvedValue([mockRole]),
      listEmployeeRoles: vi.fn().mockResolvedValue({ userId: 1, cityId: CITY_ID, roles: [mockRole] }),
      assignRole: vi.fn().mockResolvedValue({ ok: true }),
      unassignRole: vi.fn().mockResolvedValue({ ok: true }),
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  const services = buildServices();
  vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);
  vi.mocked(useCityStore).mockImplementation((sel: (s: { cityId: string | null }) => unknown) =>
    sel({ cityId: CITY_ID }),
  );
});

describe('useUserListPage', () => {
  it('loads employees and roles on mount', async () => {
    const { result } = renderHook(() => useUserListPage());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.users).toHaveLength(2);
    expect(result.current.roles).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('filters users by search query (case-insensitive)', async () => {
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setSearchQuery('ALICE'));
    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].username).toBe('alice');
  });

  it('shows all users when search query is cleared', async () => {
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setSearchQuery('alice'));
    expect(result.current.users).toHaveLength(1);
    act(() => result.current.setSearchQuery(''));
    expect(result.current.users).toHaveLength(2);
  });

  it('sets error when loading fails', async () => {
    const services = buildServices();
    (services.cityService.listEmployees as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
    vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);

    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.users).toHaveLength(0);
  });

  it('handleCreate validates required fields without calling service', async () => {
    const services = buildServices();
    vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openCreateDialog());
    await act(async () => result.current.handleCreate());

    expect(services.cityService.createAndAssignEmployee).not.toHaveBeenCalled();
    expect(result.current.createErrors.firstName).toBeTruthy();
  });

  it('handleCreate calls service with correct data and refetches', async () => {
    const services = buildServices();
    vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openCreateDialog());
    act(() => {
      result.current.setCreateField('firstName', 'Marie');
      result.current.setCreateField('lastName', 'Curie');
      result.current.setCreateField('username', 'marie.curie');
      result.current.setCreateField('email', 'marie@mairie.fr');
    });
    await act(async () => result.current.handleCreate());

    expect(services.cityService.createAndAssignEmployee).toHaveBeenCalledWith(CITY_ID, {
      firstName: 'Marie',
      lastName: 'Curie',
      username: 'marie.curie',
      email: 'marie@mairie.fr',
    });
    expect(result.current.showCreateDialog).toBe(false);
  });

  it('openEditDialog loads employee roles', async () => {
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.openEditDialog(alice));

    expect(result.current.editingUser).toEqual(alice);
    expect(result.current.editRoleIds).toEqual(['r1']);
    expect(result.current.editInitialRoleIds).toEqual(['r1']);
  });

  it('toggleEditRole adds and removes role ids', async () => {
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => result.current.openEditDialog(alice));

    act(() => result.current.toggleEditRole('r1'));
    expect(result.current.editRoleIds).toEqual([]);

    act(() => result.current.toggleEditRole('r1'));
    expect(result.current.editRoleIds).toEqual(['r1']);
  });

  it('handleFinishEdit calls assignRole / unassignRole for the diff', async () => {
    const services = buildServices();
    vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.openEditDialog(alice));
    act(() => result.current.toggleEditRole('r1'));
    await act(async () => result.current.handleFinishEdit());

    expect(services.accessService.unassignRole).toHaveBeenCalledWith(alice.id, 'r1');
    expect(services.accessService.assignRole).not.toHaveBeenCalled();
    expect(result.current.editingUser).toBeNull();
  });

  it('handleFinishEdit closes dialog without network call when no changes', async () => {
    const services = buildServices();
    vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.openEditDialog(alice));
    await act(async () => result.current.handleFinishEdit());

    expect(services.accessService.assignRole).not.toHaveBeenCalled();
    expect(services.accessService.unassignRole).not.toHaveBeenCalled();
    expect(result.current.editingUser).toBeNull();
  });

  it('closeEditDialog clears editingUser', async () => {
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => result.current.openEditDialog(alice));
    act(() => result.current.closeEditDialog());
    expect(result.current.editingUser).toBeNull();
  });

  it('handleDelete calls unassignEmployee and refetches', async () => {
    const services = buildServices();
    vi.mocked(useServices).mockReturnValue(services as ReturnType<typeof useServices>);
    const { result } = renderHook(() => useUserListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.handleDelete(alice.id));

    expect(services.cityService.unassignEmployee).toHaveBeenCalledWith(CITY_ID, alice.id);
    expect(result.current.confirmDeleteId).toBeNull();
  });
});
