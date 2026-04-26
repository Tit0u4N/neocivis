import { router } from 'expo-router';
import { useState } from 'react';
import { type ReportStatus, SEED_REPORTS } from './report.types';

export type FilterOption = 'all' | ReportStatus;

export const FILTER_OPTIONS: { id: FilterOption; labelKey: string }[] = [
  { id: 'all', labelKey: 'report.filters.all' },
  { id: 'pending', labelKey: 'report.filters.pending' },
  { id: 'progress', labelKey: 'report.filters.progress' },
  { id: 'resolved', labelKey: 'report.filters.resolved' },
];

export function useReportsList() {
  const [filter, setFilter] = useState<FilterOption>('all');
  const reports = SEED_REPORTS;
  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  const navigateToNew = () => {
    router.push('/(tabs)/report/new');
  };

  const navigateToDetail = (id: string) => {
    router.push({ pathname: '/(tabs)/report/[id]', params: { id } });
  };

  return { filter, setFilter, filtered, navigateToNew, navigateToDetail };
}
