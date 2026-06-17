import type { Report } from '@repo/contracts/report';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import type { ReportStatus } from './report.types';

export type FilterOption = 'all' | ReportStatus;

export const FILTER_OPTIONS: { id: FilterOption; labelKey: string }[] = [
  { id: 'all', labelKey: 'report.filters.all' },
  { id: 'pending', labelKey: 'report.filters.pending' },
  { id: 'progress', labelKey: 'report.filters.progress' },
  { id: 'resolved', labelKey: 'report.filters.resolved' },
];

export function useReportsList() {
  const { reportService } = useServices();

  const [filter, setFilter] = useState<FilterOption>('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    void reportService
      .getMine()
      .then((result) => {
        setReports(result.data);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reportService]);

  useFocusEffect(fetch);

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  const navigateToNew = () => {
    router.push('/(tabs)/report/new');
  };

  const navigateToDetail = (id: string) => {
    router.push({ pathname: '/(tabs)/report/[id]', params: { id } });
  };

  return { filter, setFilter, filtered, loading, error, refresh: fetch, navigateToNew, navigateToDetail };
}
