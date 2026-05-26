'use client';

import { ReportsPage } from '@/features/reports/ReportsPage';
import { useReportsPage } from '@/features/reports/useReportsPage';

export default function ReportsDashboardPage() {
  const vm = useReportsPage();
  return <ReportsPage {...vm} />;
}
