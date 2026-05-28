'use client';

import type { Report, ReportStatus } from '@repo/contracts/report';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

export type ReportSection = 'pending' | 'history';
export type ReportView = 'table' | 'map';

export type ReportsPageViewModel = {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  section: ReportSection;
  setSection: (s: ReportSection) => void;
  view: ReportView;
  setView: (v: ReportView) => void;
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  pendingReports: Report[];
  historyReports: Report[];
  updateStatus: (id: string, status: ReportStatus) => Promise<void>;
};

const PENDING_STATUSES: ReportStatus[] = ['pending', 'progress'];
const HISTORY_STATUSES: ReportStatus[] = ['resolved', 'cancelled'];

export function useReportsPage(): ReportsPageViewModel {
  const { reportService } = useServices();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<ReportSection>('pending');
  const [view, setView] = useState<ReportView>('table');

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getAll();
      setReports(data.data);
    } catch {
      setError('Impossible de charger les signalements.');
    } finally {
      setIsLoading(false);
    }
  }, [reportService]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const inProgressCount = reports.filter((r) => r.status === 'progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  const pendingReports = useMemo(() => reports.filter((r) => PENDING_STATUSES.includes(r.status)), [reports]);

  const historyReports = useMemo(() => reports.filter((r) => HISTORY_STATUSES.includes(r.status)), [reports]);

  const updateStatus = useCallback(
    async (id: string, status: ReportStatus) => {
      try {
        const updated = await reportService.updateStatus(id, status);
        setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      } catch {
        setError('Impossible de mettre à jour le signalement.');
      }
    },
    [reportService],
  );

  return {
    reports,
    isLoading,
    error,
    section,
    setSection,
    view,
    setView,
    totalCount,
    pendingCount,
    inProgressCount,
    resolvedCount,
    pendingReports,
    historyReports,
    updateStatus,
  };
}
