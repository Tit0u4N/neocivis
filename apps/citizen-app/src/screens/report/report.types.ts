export type { GpsLocation, PaginatedReportsResponse, Report, ReportStatus, ReportType } from '@repo/contracts/report';
export { REPORT_TYPES } from '@repo/contracts/report';

export function formatReportDate(createdAt: string): string {
  const d = new Date(createdAt);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}
