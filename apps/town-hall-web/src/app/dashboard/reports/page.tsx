'use client';

import { ReportsPage } from '@/components/reports/ReportsPage';
import { useReportsPage } from '@/components/reports/useReportsPage';

export default function ReportsDashboardPage() {
  const vm = useReportsPage();
  return <ReportsPage {...vm} />;
}
