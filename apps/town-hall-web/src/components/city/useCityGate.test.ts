'use client';

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockReplace, mockSetCity, storeState } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockSetCity: vi.fn(),
  storeState: { cityId: null as string | null },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/providers/ApiProvider', () => ({
  useApi: () => ({}),
}));

vi.mock('@/stores/city.store', () => ({
  useCityStore: (sel: (s: { cityId: string | null; setCity: typeof mockSetCity }) => unknown) =>
    sel({ cityId: storeState.cityId, setCity: mockSetCity }),
}));

const mockGetMe = vi.fn();
vi.mock('@repo/frontend-services/auth', () => ({
  // biome-ignore lint/style/useNamingConvention: mocking the AuthService class constructor
  AuthService: vi.fn(function (this: unknown) {
    return { getMe: mockGetMe };
  }),
}));

import { useCityGate } from './useCityGate';

afterEach(() => {
  vi.clearAllMocks();
  storeState.cityId = null;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCityGate', () => {
  it('is ready immediately and skips the lookup when a city is already stored', () => {
    storeState.cityId = 'NIC_00001';
    const { result } = renderHook(() => useCityGate());

    expect(result.current.isReady).toBe(true);
    expect(mockGetMe).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('resolves the city from /user/me, stores it, and becomes ready', async () => {
    mockGetMe.mockResolvedValue({ city: { id: 'NIC_00001', name: 'Nice' } });
    const { result } = renderHook(() => useCityGate());

    expect(result.current.isReady).toBe(false);
    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(mockSetCity).toHaveBeenCalledWith('NIC_00001', 'Nice');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('falls back to an empty city name when /user/me omits it', async () => {
    mockGetMe.mockResolvedValue({ city: { id: 'NIC_00001' } });
    const { result } = renderHook(() => useCityGate());

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(mockSetCity).toHaveBeenCalledWith('NIC_00001', '');
  });

  it('redirects to /no-city when the user has no city', async () => {
    mockGetMe.mockResolvedValue({ city: null });
    const { result } = renderHook(() => useCityGate());

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/no-city'));
    expect(result.current.isReady).toBe(false);
    expect(mockSetCity).not.toHaveBeenCalled();
  });

  it('redirects to /no-city when /user/me fails', async () => {
    mockGetMe.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useCityGate());

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/no-city'));
    expect(result.current.isReady).toBe(false);
    expect(mockSetCity).not.toHaveBeenCalled();
  });

  it('runs the lookup only once across re-renders', async () => {
    mockGetMe.mockResolvedValue({ city: { id: 'NIC_00001', name: 'Nice' } });
    const { result, rerender } = renderHook(() => useCityGate());

    await waitFor(() => expect(result.current.isReady).toBe(true));
    rerender();
    rerender();

    expect(mockGetMe).toHaveBeenCalledTimes(1);
  });
});
