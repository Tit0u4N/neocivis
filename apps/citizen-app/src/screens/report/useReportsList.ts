import type { Report } from '@repo/contracts/report';
import { ReportService } from '@repo/frontend-services/report';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';
import type { ReportStatus } from './report.types';

export type FilterOption = 'all' | ReportStatus;

export const FILTER_OPTIONS: { id: FilterOption; labelKey: string }[] = [
  { id: 'all', labelKey: 'report.filters.all' },
  { id: 'pending', labelKey: 'report.filters.pending' },
  { id: 'progress', labelKey: 'report.filters.progress' },
  { id: 'resolved', labelKey: 'report.filters.resolved' },
];

export function useReportsList() {
  const api = useApi();
  const { cityId } = useCityStore();
  const reportService = useMemo(() => new ReportService(api, cityId), [api, cityId]);

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
