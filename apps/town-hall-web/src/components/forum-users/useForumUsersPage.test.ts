'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { storeState } = vi.hoisted(() => ({
  storeState: { cityId: 'NIC_00001' as string },
}));

vi.mock('@/stores/city.store', () => ({
  useCityStore: (sel: (s: { cityId: string }) => unknown) => sel({ cityId: storeState.cityId }),
}));

const mockCityService = {
  listCitizens: vi.fn(),
};

const mockThreadService = {
  getModeration: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
};

vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ cityService: mockCityService, threadService: mockThreadService }),
}));

import { useForumUsersPage } from './useForumUsersPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CITIZENS = [
  { id: 1, username: 'titouan.lacombe', firstName: 'Titouan', lastName: 'LACOMBE' },
  { id: 2, username: 'marie.dupont', firstName: 'Marie', lastName: 'DUPONT' },
  { id: 3, username: 'paul.martin', firstName: 'Paul', lastName: 'MARTIN' },
];

const MODERATION = [{ cityId: 'NIC_00001', userId: 3, muted: false, banned: true }];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useForumUsersPage', () => {
  it('starts in loading state', () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    expect(result.current.isLoading).toBe(true);
  });

  it('loads and merges citizens with moderation data', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeUsers).toHaveLength(2);
    expect(result.current.bannedUsers).toHaveLength(1);
    expect(result.current.bannedUsers[0].username).toBe('paul.martin');
  });

  it('sets error and returns empty lists when the API fails', async () => {
    mockCityService.listCitizens.mockRejectedValue(new Error('Network'));
    mockThreadService.getModeration.mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.activeUsers).toHaveLength(0);
    expect(result.current.bannedUsers).toHaveLength(0);
  });

  it('defaults to the active tab', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tab).toBe('active');
  });

  it('setTab switches between tabs', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTab('banned'));
    expect(result.current.tab).toBe('banned');
  });

  it('filters users by search query across username, firstName, lastName', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch('marie'));
    expect(result.current.activeUsers).toHaveLength(1);
    expect(result.current.activeUsers[0].username).toBe('marie.dupont');
    expect(result.current.bannedUsers).toHaveLength(0);
  });

  it('banUser calls the service and moves the user to banned list', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue([]);
    mockThreadService.banUser.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeUsers).toHaveLength(3);

    await act(async () => {
      await result.current.banUser(1);
    });

    expect(mockThreadService.banUser).toHaveBeenCalledWith(1);
    expect(result.current.activeUsers).toHaveLength(2);
    expect(result.current.bannedUsers).toHaveLength(1);
    expect(result.current.bannedUsers[0].userId).toBe(1);
  });

  it('unbanUser calls the service and moves the user back to active list', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);
    mockThreadService.unbanUser.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.bannedUsers).toHaveLength(1);

    await act(async () => {
      await result.current.unbanUser(3);
    });

    expect(mockThreadService.unbanUser).toHaveBeenCalledWith(3);
    expect(result.current.bannedUsers).toHaveLength(0);
    expect(result.current.activeUsers).toHaveLength(3);
  });

  it('banUser sets error and does not update list when service throws', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue([]);
    mockThreadService.banUser.mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const activeCountBefore = result.current.activeUsers.length;

    await act(async () => {
      await result.current.banUser(2);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.activeUsers).toHaveLength(activeCountBefore);
    expect(result.current.bannedUsers.find((u) => u.userId === 2)).toBeUndefined();
  });

  it('unbanUser sets error and does not update list when service throws', async () => {
    mockCityService.listCitizens.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);
    mockThreadService.unbanUser.mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.unbanUser(3);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.bannedUsers.find((u) => u.userId === 3)).toBeDefined();
  });
});
