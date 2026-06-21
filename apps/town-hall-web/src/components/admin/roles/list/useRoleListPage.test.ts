'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockAccessService = {
  listRoles: vi.fn(),
  listPermissionCatalog: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  getRole: vi.fn(),
  listEmployeeRoles: vi.fn(),
  assignRole: vi.fn(),
  unassignRole: vi.fn(),
};

vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ accessService: mockAccessService }),
}));

import { useRoleListPage } from './useRoleListPage';

const MOCK_ROLES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    cityId: 'NIC_06000',
    name: 'Modérateur Forum',
    description: 'Peut modérer le forum',
    permissions: ['FORUM_THREAD_DELETE_PERMISSION', 'FORUM_THREAD_BAN_USER_PERMISSION'],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    cityId: 'NIC_06000',
    name: 'Communication',
    description: 'Peut publier des articles',
    permissions: ['ARTICLE_PUBLISH_PERMISSION'],
  },
];

const MOCK_CATALOG = [
  { key: 'ARTICLE_PUBLISH_PERMISSION' },
  { key: 'FORUM_THREAD_DELETE_PERMISSION' },
  { key: 'FORUM_THREAD_BAN_USER_PERMISSION' },
];

afterEach(() => vi.clearAllMocks());

beforeEach(() => {
  mockAccessService.listRoles.mockResolvedValue(MOCK_ROLES);
  mockAccessService.listPermissionCatalog.mockResolvedValue(MOCK_CATALOG);
});

describe('useRoleListPage', () => {
  it('starts loading and then shows roles', async () => {
    const { result } = renderHook(() => useRoleListPage());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.roles).toHaveLength(2);
    expect(result.current.permissionCatalog).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('filters roles by search query (case-insensitive)', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setSearchQuery('modé'));
    expect(result.current.roles).toHaveLength(1);
    expect(result.current.roles[0].name).toBe('Modérateur Forum');
  });

  it('shows all roles when search is cleared', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setSearchQuery('modé'));
    act(() => result.current.setSearchQuery(''));
    expect(result.current.roles).toHaveLength(2);
  });

  it('openCreateDialog resets form and shows dialog', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.openCreateDialog());
    expect(result.current.showCreateDialog).toBe(true);
    expect(result.current.createForm.name).toBe('');
    expect(result.current.createForm.permissions).toHaveLength(0);
  });

  it('setCreateField updates the form field and clears its error', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.openCreateDialog());
    act(() => result.current.setCreateField('name', 'Test Role'));
    expect(result.current.createForm.name).toBe('Test Role');
  });

  it('toggleCreatePermission adds and removes permissions', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.openCreateDialog());
    act(() => result.current.toggleCreatePermission('ARTICLE_PUBLISH_PERMISSION'));
    expect(result.current.createForm.permissions).toContain('ARTICLE_PUBLISH_PERMISSION');
    act(() => result.current.toggleCreatePermission('ARTICLE_PUBLISH_PERMISSION'));
    expect(result.current.createForm.permissions).not.toContain('ARTICLE_PUBLISH_PERMISSION');
  });

  it('handleCreate sets name error when name is empty', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.openCreateDialog());
    await act(async () => {
      await result.current.handleCreate();
    });
    expect(result.current.createErrors.name).toBeTruthy();
    expect(mockAccessService.createRole).not.toHaveBeenCalled();
  });

  it('handleCreate calls createRole and closes dialog on success', async () => {
    mockAccessService.createRole.mockResolvedValue(MOCK_ROLES[0]);
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.openCreateDialog());
    act(() => result.current.setCreateField('name', 'Nouveau Rôle'));
    await act(async () => {
      await result.current.handleCreate();
    });
    expect(mockAccessService.createRole).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nouveau Rôle' }));
    expect(result.current.showCreateDialog).toBe(false);
  });

  it('openEditDialog populates editForm with role data', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.openEditDialog(
        MOCK_ROLES[0] as (typeof MOCK_ROLES)[0] & { cityId: `${string}_${string}` } as Parameters<
          typeof result.current.openEditDialog
        >[0],
      ),
    );
    expect(result.current.editingRole?.id).toBe(MOCK_ROLES[0].id);
    expect(result.current.editForm.name).toBe('Modérateur Forum');
    expect(result.current.editForm.permissions).toHaveLength(2);
  });

  it('closeEditDialog clears editingRole', async () => {
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.openEditDialog(MOCK_ROLES[0] as Parameters<typeof result.current.openEditDialog>[0]));
    act(() => result.current.closeEditDialog());
    expect(result.current.editingRole).toBeNull();
  });

  it('handleDelete calls deleteRole and refetches', async () => {
    mockAccessService.deleteRole.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setConfirmDeleteId(MOCK_ROLES[0].id));
    await act(async () => {
      await result.current.handleDelete(MOCK_ROLES[0].id);
    });
    expect(mockAccessService.deleteRole).toHaveBeenCalledWith(MOCK_ROLES[0].id);
    expect(result.current.confirmDeleteId).toBeNull();
  });

  it('sets error message when fetchData fails', async () => {
    mockAccessService.listRoles.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useRoleListPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.roles).toHaveLength(0);
  });
});
