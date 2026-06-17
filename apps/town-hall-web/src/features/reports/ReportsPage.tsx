'use client';

import type { Report, ReportStatus } from '@repo/contracts/report';
import { Download, MapIcon, MoreHorizontal, Table2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ReportsPageViewModel } from './useReportsPage';

// --- Status badge ---

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }: { status: ReportStatus }) {
  const { t } = useTranslation();
  return (
    <Badge className={cn('rounded-full font-semibold text-xs', STATUS_STYLES[status])}>
      {t(`reports.status.${status}`)}
    </Badge>
  );
}

// --- Stat card ---

function StatCard({ label, value, valueClass }: { label: string; value: number; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="mb-1.5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn('font-bold text-3xl', valueClass ?? 'text-foreground')}>{value}</p>
    </div>
  );
}

// --- Detail dialog ---

function formatLocation(report: Report): string {
  if (!report.location) {
    return '—';
  }
  return `${report.location.latitude.toFixed(5)}, ${report.location.longitude.toFixed(5)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatId(id: string): string {
  return `RPT-${id.slice(0, 6).toUpperCase()}`;
}

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-foreground text-sm">{value}</span>
    </div>
  );
}

const ALL_STATUSES: ReportStatus[] = ['pending', 'progress', 'resolved', 'cancelled'];

function ReportDetailDialog({
  report,
  open,
  onClose,
  onUpdateStatus,
}: {
  report: Report | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ReportStatus) => Promise<void>;
}) {
  const { t } = useTranslation();
  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-muted-foreground text-sm">{formatId(report.id)}</span>
            <span>{report.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-1">
          {/* Photo */}
          {report.photoUrl && (
            // biome-ignore lint/performance/noImgElement: external URL
            <img src={report.photoUrl} alt={report.title} className="h-56 w-full rounded-lg object-cover" />
          )}

          {/* Status + modifier */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                {t('reports.table.status')}
              </span>
              <StatusBadge status={report.status} />
            </div>
            <Select value={report.status} onValueChange={(val) => onUpdateStatus(report.id, val as ReportStatus)}>
              <SelectTrigger className="h-8 w-40 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`reports.status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailRow label={t('reports.table.category')} value={report.type} />
            <DetailRow label={t('reports.table.date')} value={formatDate(report.createdAt)} />
            <DetailRow label={t('reports.table.location')} value={formatLocation(report)} />
            <DetailRow label={t('reports.table.author')} value={report.authorId} />
            {report.resolvedAt && (
              <DetailRow label={t('reports.detail.resolvedAt')} value={formatDate(report.resolvedAt)} />
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
              {t('reports.detail.description')}
            </span>
            <p className="text-foreground text-sm leading-relaxed">{report.desc}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Reports table ---

function ReportsTable({
  data,
  showHistory,
  onUpdateStatus,
}: {
  data: Report[];
  showHistory: boolean;
  onUpdateStatus: (id: string, status: ReportStatus) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16">
        <p className="text-muted-foreground text-sm">{t('reports.empty')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-border border-b bg-muted/40">
              {[
                t('reports.table.id'),
                t('reports.table.title'),
                t('reports.table.category'),
                t('reports.table.location'),
                t('reports.table.date'),
                t('reports.table.status'),
                showHistory ? t('reports.table.resolvedBy') : t('reports.table.author'),
                '',
              ].map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-2.5 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={r.id}
                className={cn(
                  'border-border border-b transition-colors last:border-0 hover:bg-muted/30',
                  i % 2 === 1 && 'bg-muted/10',
                )}
              >
                <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{formatId(r.id)}</td>
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">{r.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatLocation(r)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {showHistory ? (r.resolvedAt ? formatDate(r.resolvedAt) : '—') : r.authorId.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={(props) => (
                        <button
                          type="button"
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          {...props}
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      )}
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedReport(r)}>
                        {t('reports.actions.detail')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReportDetailDialog
        report={selectedReport}
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={async (id, status) => {
          await onUpdateStatus(id, status);
          setSelectedReport((prev) => (prev?.id === id ? { ...prev, status } : prev));
        }}
      />
    </>
  );
}

// --- Main page ---

export function ReportsPage(vm: ReportsPageViewModel) {
  const { t } = useTranslation();
  const {
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
  } = vm;

  const activeData = section === 'pending' ? pendingReports : historyReports;

  return (
    <PageLayout title={t('reports.title')}>
      {/* Header actions */}
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          {t('reports.export')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t('reports.stats.total')} value={totalCount} />
        <StatCard label={t('reports.stats.pending')} value={pendingCount} valueClass="text-amber-700" />
        <StatCard label={t('reports.stats.inProgress')} value={inProgressCount} valueClass="text-blue-700" />
        <StatCard label={t('reports.stats.resolved')} value={resolvedCount} valueClass="text-green-700" />
      </div>

      {/* Section tabs + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex border-border border-b">
          {(
            [
              { id: 'pending', label: t('reports.tabs.pending') },
              { id: 'history', label: t('reports.tabs.history') },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={cn(
                '-mb-px border-b-2 px-5 py-2 font-medium text-sm transition-colors',
                section === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
            className="gap-1.5"
          >
            <Table2 className="size-3.5" />
            {t('reports.view.table')}
          </Button>
          <Button
            size="sm"
            variant={view === 'map' ? 'default' : 'outline'}
            onClick={() => setView('map')}
            className="gap-1.5"
          >
            <MapIcon className="size-3.5" />
            {t('reports.view.map')}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-destructive text-sm">{t('reports.error')}</p>
        </div>
      ) : view === 'table' ? (
        <ReportsTable data={activeData} showHistory={section === 'history'} onUpdateStatus={updateStatus} />
      ) : (
        <div className="flex h-[420px] items-center justify-center rounded-xl border border-border bg-muted/20">
          <p className="text-muted-foreground text-sm">{t('reports.map.placeholder', { count: activeData.length })}</p>
        </div>
      )}
    </PageLayout>
  );
}
