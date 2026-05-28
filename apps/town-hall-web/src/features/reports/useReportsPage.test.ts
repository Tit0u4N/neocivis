'use client';

import type { Report, ReportStatus } from '@repo/contracts/report';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReportService = {
  getAll: vi.fn(),
  updateStatus: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ reportService: mockReportService }),
}));

import { useReportsPage } from './useReportsPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeReport(id: string, status: ReportStatus, overrides: Partial<Report> = {}): Report {
  return {
    id,
    authorId: 'usr-test',
    title: `Signalement ${id}`,
    type: 'Voirie',
    status,
    desc: 'Description du signalement.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7102, longitude: 7.262 },
    createdAt: '2026-11-15T09:00:00.000Z',
    updatedAt: '2026-11-15T09:00:00.000Z',
    ...overrides,
  };
}

const REPORTS: Report[] = [
  makeReport('r-1', 'pending'),
  makeReport('r-2', 'progress'),
  makeReport('r-3', 'resolved', { resolvedAt: '2026-11-16T09:00:00.000Z' }),
  makeReport('r-4', 'pending'),
  makeReport('r-5', 'cancelled', { resolvedAt: '2026-11-16T09:00:00.000Z' }),
  makeReport('r-6', 'resolved', { resolvedAt: '2026-11-16T09:00:00.000Z' }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useReportsPage', () => {
  it('loads reports on mount and clears loading state', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    const { result } = renderHook(() => useReportsPage());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.reports).toHaveLength(6);
    expect(result.current.error).toBeNull();
  });

  it('sets an error and keeps reports empty when getAll throws', async () => {
    mockReportService.getAll.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useReportsPage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.reports).toHaveLength(0);
    expect(result.current.error).not.toBeNull();
  });

  it('computes the status counts', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.totalCount).toBe(6);
    expect(result.current.pendingCount).toBe(2);
    expect(result.current.inProgressCount).toBe(1);
    expect(result.current.resolvedCount).toBe(2);
  });

  it('splits reports into pending (pending + progress) and history (resolved + cancelled)', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pendingReports.map((r) => r.id)).toEqual(['r-1', 'r-2', 'r-4']);
    expect(result.current.historyReports.map((r) => r.id)).toEqual(['r-3', 'r-5', 'r-6']);
  });

  it('defaults to the pending section and table view', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.section).toBe('pending');
    expect(result.current.view).toBe('table');
  });

  it('setSection updates the active section', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSection('history'));
    expect(result.current.section).toBe('history');
  });

  it('setView updates the active view', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setView('map'));
    expect(result.current.view).toBe('map');
  });

  it('updateStatus calls the service and replaces the report with the returned one', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    mockReportService.updateStatus.mockResolvedValue(makeReport('r-1', 'resolved'));
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateStatus('r-1', 'resolved');
    });

    expect(mockReportService.updateStatus).toHaveBeenCalledWith('r-1', 'resolved');
    expect(result.current.reports.find((r) => r.id === 'r-1')?.status).toBe('resolved');
  });

  it('updateStatus sets an error and leaves the report unchanged when the service throws', async () => {
    mockReportService.getAll.mockResolvedValue({ data: REPORTS });
    mockReportService.updateStatus.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useReportsPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateStatus('r-2', 'cancelled');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.reports.find((r) => r.id === 'r-2')?.status).toBe('progress');
  });
});
