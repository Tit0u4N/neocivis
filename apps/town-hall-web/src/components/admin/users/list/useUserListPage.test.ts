'use client';

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { useUserListPage } from './useUserListPage';

afterEach(() => vi.clearAllMocks());

describe('useUserListPage', () => {
  it('starts with all 4 mock users and not loading', () => {
    const { result } = renderHook(() => useUserListPage());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.users).toHaveLength(4);
    expect(result.current.error).toBeNull();
  });

  it('filters by role ADMIN', () => {
    const { result } = renderHook(() => useUserListPage());
    act(() => result.current.setRoleFilter('ADMIN'));
    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].username).toBe('alice.martin');
  });

  it('filters by role EMPLOYEE', () => {
    const { result } = renderHook(() => useUserListPage());
    act(() => result.current.setRoleFilter('EMPLOYEE'));
    expect(result.current.users).toHaveLength(3);
  });

  it('filters by search query (case-insensitive)', () => {
    const { result } = renderHook(() => useUserListPage());
    act(() => result.current.setSearchQuery('ALICE'));
    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].username).toBe('alice.martin');
  });

  it('applies both role and search filters', () => {
    const { result } = renderHook(() => useUserListPage());
    act(() => {
      result.current.setRoleFilter('EMPLOYEE');
      result.current.setSearchQuery('bob');
    });
    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].username).toBe('bob.dupont');
  });

  it('handleDelete removes the user and clears confirmDeleteId', () => {
    const { result } = renderHook(() => useUserListPage());
    act(() => result.current.handleDelete(1));
    expect(result.current.users.find((u) => u.id === 1)).toBeUndefined();
    expect(result.current.confirmDeleteId).toBeNull();
  });

  it('openEditDialog sets editingUser and editRole', () => {
    const { result } = renderHook(() => useUserListPage());
    const alice = result.current.users[0];
    act(() => result.current.openEditDialog(alice));
    expect(result.current.editingUser?.id).toBe(alice.id);
    expect(result.current.editRole).toBe(alice.role);
  });

  it('closeEditDialog clears editingUser', () => {
    const { result } = renderHook(() => useUserListPage());
    const alice = result.current.users[0];
    act(() => result.current.openEditDialog(alice));
    act(() => result.current.closeEditDialog());
    expect(result.current.editingUser).toBeNull();
  });

  it('handleFinishEdit updates the user role in the list', () => {
    const { result } = renderHook(() => useUserListPage());
    const bob = result.current.users.find((u) => u.username === 'bob.dupont');
    if (!bob) {
      throw new Error('bob not found');
    }
    act(() => result.current.openEditDialog(bob));
    act(() => result.current.setEditRole('ADMIN'));
    act(() => result.current.handleFinishEdit());
    const updated = result.current.users.find((u) => u.id === bob.id);
    expect(updated?.role).toBe('ADMIN');
    expect(result.current.editingUser).toBeNull();
  });
});
