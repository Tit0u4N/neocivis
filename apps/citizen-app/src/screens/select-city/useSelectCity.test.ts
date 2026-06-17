//@ts-nocheck
/** biome-ignore-all lint/suspicious/useAwait: TEST FILE */

import type { CityPublicDto } from '@repo/contracts';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const {
  mockListCities,
  mockJoinCity,
  mockCityService,
  mockSetCityId,
  mockSetCity,
  mockRefresh,
  mockReplace,
  mockToastError,
  mockT,
} = vi.hoisted(() => {
  const mockListCities = vi.fn<[], Promise<CityPublicDto[]>>();
  const mockJoinCity = vi.fn<[string], Promise<void>>();
  const mockSetCityId = vi.fn();
  const mockSetCity = vi.fn();
  const mockRefresh = vi.fn();
  const mockReplace = vi.fn();
  const mockToastError = vi.fn();
  const mockT = vi.fn((key: string) => key);
  return {
    mockListCities,
    mockJoinCity,
    mockCityService: { listCities: mockListCities, joinCity: mockJoinCity },
    mockSetCityId,
    mockSetCity,
    mockRefresh,
    mockReplace,
    mockToastError,
    mockT,
  };
});

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ cityService: mockCityService }),
}));

vi.mock('@/stores/city.store', () => ({
  useCityStore: () => ({ setCityId: mockSetCityId, setCity: mockSetCity }),
}));

vi.mock('@/stores/profile.store', () => ({
  useProfile: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ error: mockToastError }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeCity = (overrides: Partial<CityPublicDto> = {}): CityPublicDto => ({
  id: 'city-1',
  name: 'Nice',
  description: "Côte d'Azur",
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSelectCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge les villes au montage', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    const cities = [makeCity(), makeCity({ id: 'city-2', name: 'Paris' })];
    mockListCities.mockResolvedValue(cities);

    const { result } = renderHook(() => useSelectCity());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cities).toHaveLength(2);
  });

  it('retourne une liste vide sans toast si aucune ville', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    mockListCities.mockResolvedValue([]);

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cities).toEqual([]);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("affiche un toast avec le message d'erreur API si listCities échoue", async () => {
    const { useSelectCity } = await import('./useSelectCity');
    mockListCities.mockRejectedValue(new Error('network timeout'));

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockToastError).toHaveBeenCalledWith('selectCity.errors.loadTitle', 'network timeout');
    expect(result.current.cities).toEqual([]);
  });

  it('affiche le message fallback i18n si listCities échoue sans message', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    mockListCities.mockRejectedValue('erreur non-Error');

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockToastError).toHaveBeenCalledWith('selectCity.errors.loadTitle', 'selectCity.errors.loadDesc');
  });

  it('filtre les villes par query (insensible à la casse)', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    mockListCities.mockResolvedValue([makeCity({ name: 'Nice' }), makeCity({ id: 'city-2', name: 'Paris' })]);

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setQuery('NIC'));
    expect(result.current.cities).toHaveLength(1);
    expect(result.current.cities[0].name).toBe('Nice');
  });

  it('retourne toutes les villes si query est vide', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    mockListCities.mockResolvedValue([makeCity({ name: 'Nice' }), makeCity({ id: 'city-2', name: 'Paris' })]);

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setQuery('nic'));
    act(() => result.current.setQuery(''));
    expect(result.current.cities).toHaveLength(2);
  });

  it('retourne toutes les villes si query contient uniquement des espaces', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    mockListCities.mockResolvedValue([makeCity({ name: 'Nice' }), makeCity({ id: 'city-2', name: 'Paris' })]);

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setQuery('   '));
    expect(result.current.cities).toHaveLength(2);
  });

  it('onSelect rejoint la ville et navigue vers les tabs', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    const city = makeCity();
    mockListCities.mockResolvedValue([city]);
    mockJoinCity.mockResolvedValue(undefined);
    mockRefresh.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.onSelect(city);
    });

    expect(mockJoinCity).toHaveBeenCalledWith('city-1');
    expect(mockSetCityId).toHaveBeenCalledWith('city-1');
    expect(mockSetCity).toHaveBeenCalledWith(city);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(city)');
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('affiche un toast avec le message API si joinCity échoue', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    const city = makeCity();
    mockListCities.mockResolvedValue([city]);
    mockJoinCity.mockRejectedValue(new Error('forbidden'));

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.onSelect(city);
    });

    expect(mockToastError).toHaveBeenCalledWith('selectCity.errors.joinTitle', 'forbidden');
    expect(result.current.joiningId).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('affiche le message fallback i18n si joinCity échoue sans message', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    const city = makeCity({ name: 'Nice' });
    mockListCities.mockResolvedValue([city]);
    mockJoinCity.mockRejectedValue('erreur non-Error');

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.onSelect(city);
    });

    expect(mockToastError).toHaveBeenCalledWith('selectCity.errors.joinTitle', 'selectCity.errors.joinDesc');
  });

  it("joiningId est défini pendant le chargement puis remis à null en cas d'erreur", async () => {
    const { useSelectCity } = await import('./useSelectCity');
    const city = makeCity();
    mockListCities.mockResolvedValue([city]);

    let rejectJoin!: (err: Error) => void;
    mockJoinCity.mockReturnValue(
      new Promise<void>((_, rej) => {
        rejectJoin = rej;
      }),
    );

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      void result.current.onSelect(city);
    });
    await waitFor(() => expect(result.current.joiningId).toBe('city-1'));

    await act(async () => {
      rejectJoin(new Error('timeout'));
    });
    expect(result.current.joiningId).toBeNull();
  });

  it('ne re-soumet pas si une sélection est déjà en cours', async () => {
    const { useSelectCity } = await import('./useSelectCity');
    const city = makeCity();
    mockListCities.mockResolvedValue([city]);

    let resolveJoin!: () => void;
    mockJoinCity.mockReturnValue(
      new Promise<void>((res) => {
        resolveJoin = res;
      }),
    );

    const { result } = renderHook(() => useSelectCity());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      void result.current.onSelect(city);
    });
    await waitFor(() => expect(result.current.joiningId).toBe('city-1'));

    await act(async () => {
      await result.current.onSelect(city);
    });
    expect(mockJoinCity).toHaveBeenCalledTimes(1);

    resolveJoin();
  });
});
