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

const MOCK_REPORTS: Report[] = [
  {
    id: '11111111-0001-0000-0000-000000000001',
    authorId: 'usr-bernard',
    title: 'Nid de poule route D7',
    type: 'Voirie',
    status: 'pending',
    desc: 'Un nid de poule dangereux est apparu sur la route départementale D7.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7102, longitude: 7.262 },
    createdAt: '2026-11-15T09:00:00.000Z',
    updatedAt: '2026-11-15T09:00:00.000Z',
  },
  {
    id: '11111111-0002-0000-0000-000000000002',
    authorId: 'usr-leroy',
    title: 'Lampadaire défectueux',
    type: 'Éclairage public',
    status: 'progress',
    desc: 'Le lampadaire au 14 rue des Mimosas ne fonctionne plus depuis une semaine.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7158, longitude: 7.2694 },
    createdAt: '2026-11-14T14:30:00.000Z',
    updatedAt: '2026-11-14T16:00:00.000Z',
  },
  {
    id: '11111111-0003-0000-0000-000000000003',
    authorId: 'usr-dupont',
    title: 'Graffiti sur le mur du stade',
    type: 'Propreté',
    status: 'resolved',
    desc: 'Des graffitis ont été tagués sur le mur nord du stade municipal.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7045, longitude: 7.2543 },
    createdAt: '2026-11-13T08:15:00.000Z',
    updatedAt: '2026-11-14T10:00:00.000Z',
    resolvedAt: '2026-11-14T10:00:00.000Z',
  },
  {
    id: '11111111-0004-0000-0000-000000000004',
    authorId: 'usr-martin',
    title: 'Poubelle débordante parc central',
    type: 'Propreté',
    status: 'pending',
    desc: 'La poubelle près de la fontaine du parc central déborde depuis plusieurs jours.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7089, longitude: 7.2601 },
    createdAt: '2026-11-12T11:45:00.000Z',
    updatedAt: '2026-11-12T11:45:00.000Z',
  },
  {
    id: '11111111-0005-0000-0000-000000000005',
    authorId: 'usr-girard',
    title: 'Banc cassé allée des Pins',
    type: 'Mobilier urbain',
    status: 'cancelled',
    desc: 'Un banc est cassé et présente un risque de blessure allée des Pins.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7121, longitude: 7.2578 },
    createdAt: '2026-11-11T16:20:00.000Z',
    updatedAt: '2026-11-12T09:00:00.000Z',
    resolvedAt: '2026-11-12T09:00:00.000Z',
  },
  {
    id: '11111111-0006-0000-0000-000000000006',
    authorId: 'usr-blanc',
    title: 'Trottoir endommagé avenue de la Liberté',
    type: 'Voirie',
    status: 'progress',
    desc: 'Plusieurs dalles de trottoir sont soulevées et dangereuses pour les piétons.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7067, longitude: 7.2652 },
    createdAt: '2026-11-10T07:30:00.000Z',
    updatedAt: '2026-11-11T08:00:00.000Z',
  },
  {
    id: '11111111-0007-0000-0000-000000000007',
    authorId: 'usr-moreau',
    title: 'Fissure trottoir centre-ville',
    type: 'Voirie',
    status: 'resolved',
    desc: 'Une large fissure traverse le trottoir près de la mairie.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7103, longitude: 7.261 },
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-05T14:00:00.000Z',
    resolvedAt: '2026-10-05T14:00:00.000Z',
  },
  {
    id: '11111111-0008-0000-0000-000000000008',
    authorId: 'usr-simon',
    title: 'Véhicule abandonné rue du Marché',
    type: 'Sécurité',
    status: 'resolved',
    desc: 'Une voiture sans plaque est garée depuis plus de deux semaines.',
    photoUrl: 'https://placehold.co/400x300',
    location: { latitude: 43.7133, longitude: 7.2621 },
    createdAt: '2026-09-28T09:00:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z',
    resolvedAt: '2026-10-01T11:00:00.000Z',
  },
];

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
      // Backend not available yet — use mock data
      setReports(MOCK_REPORTS);
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
        await reportService.updateStatus(id, status);
      } catch {
        // Backend not available yet — update locally
      } finally {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r)),
        );
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
