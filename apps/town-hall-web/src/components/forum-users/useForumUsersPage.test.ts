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

const mockThreadService = {
  getModeration: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ threadService: mockThreadService }),
}));

const mockApiGet = vi.fn();
const mockApi = { get: (url: string) => ({ json: () => mockApiGet(url) }) };
vi.mock('@/providers/ApiProvider', () => ({
  useApi: () => mockApi,
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
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    expect(result.current.isLoading).toBe(true);
  });

  it('loads and merges citizens with moderation data', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeUsers).toHaveLength(2);
    expect(result.current.bannedUsers).toHaveLength(1);
    expect(result.current.bannedUsers[0].username).toBe('paul.martin');
  });

  it('falls back to mock users when the API fails', async () => {
    mockApiGet.mockRejectedValue(new Error('Network'));
    mockThreadService.getModeration.mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeUsers.length).toBeGreaterThan(0);
    expect(result.current.bannedUsers.length).toBeGreaterThan(0);
  });

  it('defaults to the active tab', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tab).toBe('active');
  });

  it('setTab switches between tabs', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTab('banned'));
    expect(result.current.tab).toBe('banned');
  });

  it('filters users by search query across username, firstName, lastName', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch('marie'));
    expect(result.current.activeUsers).toHaveLength(1);
    expect(result.current.activeUsers[0].username).toBe('marie.dupont');
    expect(result.current.bannedUsers).toHaveLength(0);
  });

  it('banUser calls the service and moves the user to banned list', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
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
    mockApiGet.mockResolvedValue(CITIZENS);
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

  it('banUser updates the user locally even when the service throws', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue([]);
    mockThreadService.banUser.mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.banUser(2);
    });

    expect(result.current.bannedUsers.find((u) => u.userId === 2)).toBeDefined();
  });

  it('unbanUser updates the user locally even when the service throws', async () => {
    mockApiGet.mockResolvedValue(CITIZENS);
    mockThreadService.getModeration.mockResolvedValue(MODERATION);
    mockThreadService.unbanUser.mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useForumUsersPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.unbanUser(3);
    });

    expect(result.current.activeUsers.find((u) => u.userId === 3)).toBeDefined();
  });
});
