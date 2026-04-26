//@ts-nocheck

import type { PaginatedReportsResponse, Report } from '@repo/contracts/report';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Hoisted mocks (evaluated before vi.mock factories) ─────────────────────

const { mockGetMine, mockGetById, mockCancel, mockCreate, mockRouter, mockLocationModule, mockImagePickerModule } =
  vi.hoisted(() => ({
    mockGetMine: vi.fn<[], Promise<PaginatedReportsResponse>>(),
    mockGetById: vi.fn<[string], Promise<Report>>(),
    mockCancel: vi.fn<[string], Promise<Report>>(),
    mockCreate: vi.fn<[], Promise<Report>>(),
    mockRouter: { back: vi.fn(), push: vi.fn() },
    mockLocationModule: {
      requestForegroundPermissionsAsync: vi.fn(),
      getCurrentPositionAsync: vi.fn(),
      Accuracy: { Balanced: 3 },
    },
    mockImagePickerModule: {
      requestMediaLibraryPermissionsAsync: vi.fn(),
      launchImageLibraryAsync: vi.fn(),
      requestCameraPermissionsAsync: vi.fn(),
      launchCameraAsync: vi.fn(),
    },
  }));

// ── Module mocks ────────────────────────────────────────────────────────────

vi.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require('react');
  return {
    router: mockRouter,
    // biome-ignore  lint/suspicious/noConfusingVoidType : intentional
    useFocusEffect: (cb: () => void | (() => void)) => {
      useEffect(() => {
        cb();
      }, []);
    },
  };
});

vi.mock('@/providers/ApiProvider', () => {
  const stableApi = {};
  return { useApi: () => stableApi };
});

vi.mock('@repo/frontend-services/report', () => ({
  // biome-ignore lint/style/useNamingConvention: mock constructor must be regular function
  ReportService: vi.fn(() => ({
    getMine: mockGetMine,
    getById: mockGetById,
    cancel: mockCancel,
    create: mockCreate,
  })),
}));

vi.mock('expo-location', () => mockLocationModule);
vi.mock('expo-image-picker', () => mockImagePickerModule);

// ── Fixtures ────────────────────────────────────────────────────────────────

const makeReport = (overrides: Partial<Report> = {}): Report => ({
  id: 'r-1',
  authorId: 'user-1',
  title: 'Lampadaire défectueux',
  type: 'Éclairage public',
  status: 'pending',
  desc: 'Le lampadaire clignote.',
  createdAt: '2026-04-12T10:00:00.000Z',
  updatedAt: '2026-04-12T10:00:00.000Z',
  ...overrides,
});

const makePaginated = (reports: Report[]): PaginatedReportsResponse => ({
  data: reports,
  total: reports.length,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(reports.length / 10) || 1,
});

// ── useReportsList ──────────────────────────────────────────────────────────

describe('useReportsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge les signalements au montage', async () => {
    const { useReportsList } = await import('./useReportsList');
    const reports = [makeReport({ id: 'r-1', status: 'pending' })];
    mockGetMine.mockResolvedValue(makePaginated(reports));

    const { result } = renderHook(() => useReportsList());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("expose l'erreur si getMine échoue", async () => {
    const { useReportsList } = await import('./useReportsList');
    mockGetMine.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useReportsList());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('error');
    expect(result.current.filtered).toEqual([]);
  });

  it('filtre par statut', async () => {
    const { useReportsList } = await import('./useReportsList');
    const reports = [makeReport({ id: 'r-1', status: 'pending' }), makeReport({ id: 'r-2', status: 'resolved' })];
    mockGetMine.mockResolvedValue(makePaginated(reports));

    const { result } = renderHook(() => useReportsList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFilter('pending'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].status).toBe('pending');
  });

  it('retourne tout si filtre = all', async () => {
    const { useReportsList } = await import('./useReportsList');
    const reports = [makeReport({ id: 'r-1', status: 'pending' }), makeReport({ id: 'r-2', status: 'resolved' })];
    mockGetMine.mockResolvedValue(makePaginated(reports));

    const { result } = renderHook(() => useReportsList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFilter('all'));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('navigateToNew appelle router.push', async () => {
    const { useReportsList } = await import('./useReportsList');
    mockGetMine.mockResolvedValue(makePaginated([]));

    const { result } = renderHook(() => useReportsList());
    act(() => result.current.navigateToNew());

    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/report/new');
  });

  it("navigateToDetail appelle router.push avec l'id", async () => {
    const { useReportsList } = await import('./useReportsList');
    mockGetMine.mockResolvedValue(makePaginated([]));

    const { result } = renderHook(() => useReportsList());
    act(() => result.current.navigateToDetail('r-42'));

    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/(tabs)/report/[id]', params: { id: 'r-42' } });
  });
});

// ── useReportDetails ────────────────────────────────────────────────────────

describe('useReportDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge le signalement au montage', async () => {
    const { useReportDetails } = await import('./useReportDetails');
    mockGetById.mockResolvedValue(makeReport());

    const { result } = renderHook(() => useReportDetails('r-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.report?.id).toBe('r-1');
    expect(result.current.error).toBeNull();
  });

  it("expose l'erreur si getById échoue", async () => {
    const { useReportDetails } = await import('./useReportDetails');
    mockGetById.mockRejectedValue(new Error('not found'));

    const { result } = renderHook(() => useReportDetails('r-inexistant'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('error');
    expect(result.current.report).toBeNull();
  });

  it("ouvre et ferme la dialog d'annulation", async () => {
    const { useReportDetails } = await import('./useReportDetails');
    mockGetById.mockResolvedValue(makeReport());

    const { result } = renderHook(() => useReportDetails('r-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.showCancelDialog).toBe(false);
    act(() => result.current.openCancelDialog());
    expect(result.current.showCancelDialog).toBe(true);
    act(() => result.current.closeCancelDialog());
    expect(result.current.showCancelDialog).toBe(false);
  });

  it('confirmCancel appelle cancel et navigue en arrière', async () => {
    const { useReportDetails } = await import('./useReportDetails');
    const cancelled = makeReport({ status: 'cancelled' });
    mockGetById.mockResolvedValue(makeReport());
    mockCancel.mockResolvedValue(cancelled);

    const { result } = renderHook(() => useReportDetails('r-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openCancelDialog());
    await act(async () => {
      await result.current.confirmCancel();
    });

    expect(mockCancel).toHaveBeenCalledWith('r-1');
    expect(result.current.report?.status).toBe('cancelled');
    expect(mockRouter.back).toHaveBeenCalled();
    expect(result.current.showCancelDialog).toBe(false);
  });

  it("ne re-soumet pas si déjà en cours d'annulation", async () => {
    const { useReportDetails } = await import('./useReportDetails');
    let resolveCancel!: (v: ReturnType<typeof makeReport>) => void;
    const hangingPromise = new Promise<ReturnType<typeof makeReport>>((res) => {
      resolveCancel = res;
    });
    mockGetById.mockResolvedValue(makeReport());
    mockCancel.mockReturnValue(hangingPromise);

    const { result } = renderHook(() => useReportDetails('r-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openCancelDialog());
    // Lance premier appel sans awaiter la résolution
    act(() => {
      void result.current.confirmCancel();
    });
    await waitFor(() => expect(result.current.cancelling).toBe(true));
    // Deuxième appel doit être ignoré (cancelling = true)
    await act(async () => {
      await result.current.confirmCancel();
    });
    expect(mockCancel).toHaveBeenCalledTimes(1);
    // Résoudre pour éviter le leak de promesse
    resolveCancel(makeReport({ status: 'cancelled' }));
  });
});

// ── useNewReport ────────────────────────────────────────────────────────────

describe('useNewReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationModule.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLocationModule.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 43.2965, longitude: 5.3698 },
    });
  });

  it('passe à status ready quand la permission est accordée', async () => {
    const { useNewReport } = await import('./useNewReport');
    const { result } = renderHook(() => useNewReport());

    await waitFor(() => expect(result.current.location.status).toBe('ready'));
    expect(result.current.location).toEqual({
      status: 'ready',
      coords: { latitude: 43.2965, longitude: 5.3698 },
    });
  });

  it('passe à status denied si permission refusée', async () => {
    const { useNewReport } = await import('./useNewReport');
    mockLocationModule.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useNewReport());
    await waitFor(() => expect(result.current.location.status).toBe('denied'));
  });

  it('valid est false si desc <= 5 caractères', async () => {
    const { useNewReport } = await import('./useNewReport');
    const { result } = renderHook(() => useNewReport());

    act(() => result.current.setDesc('abc'));
    expect(result.current.valid).toBe(false);
  });

  it('valid est true si desc > 5 caractères', async () => {
    const { useNewReport } = await import('./useNewReport');
    const { result } = renderHook(() => useNewReport());

    act(() => result.current.setDesc('Trottoir abîmé'));
    expect(result.current.valid).toBe(true);
  });

  it('removePhoto remet le statut photo à none', async () => {
    const { useNewReport } = await import('./useNewReport');
    mockImagePickerModule.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePickerModule.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
    });

    const { result } = renderHook(() => useNewReport());
    await act(async () => {
      await result.current.pickFromGallery();
    });
    expect(result.current.photo.status).toBe('picked');

    act(() => result.current.removePhoto());
    expect(result.current.photo.status).toBe('none');
  });

  it('pickFromGallery ignore si permission refusée', async () => {
    const { useNewReport } = await import('./useNewReport');
    mockImagePickerModule.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useNewReport());
    await act(async () => {
      await result.current.pickFromGallery();
    });

    expect(result.current.photo.status).toBe('none');
  });

  it('submit crée le signalement et navigue en arrière', async () => {
    const { useNewReport } = await import('./useNewReport');
    mockCreate.mockResolvedValue(makeReport());

    const { result } = renderHook(() => useNewReport());
    await waitFor(() => expect(result.current.location.status).toBe('ready'));

    act(() => result.current.setDesc('Nid de poule dangereux'));
    await act(async () => {
      await result.current.submit();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        desc: 'Nid de poule dangereux',
        latitude: 43.2965,
        longitude: 5.3698,
      }),
    );
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('submit ne fait rien si desc invalide', async () => {
    const { useNewReport } = await import('./useNewReport');
    const { result } = renderHook(() => useNewReport());

    act(() => result.current.setDesc('abc'));
    await act(async () => {
      await result.current.submit();
    });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('cancel appelle router.back', async () => {
    const { useNewReport } = await import('./useNewReport');
    const { result } = renderHook(() => useNewReport());

    act(() => result.current.cancel());
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
