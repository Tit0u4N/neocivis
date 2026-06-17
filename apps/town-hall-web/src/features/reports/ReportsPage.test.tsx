// @ts-nocheck

'use client';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div>
      {title && <h1>{title}</h1>}
      {children}
    </div>
  ),
}));

import { ReportsPage } from './ReportsPage';

afterEach(cleanup);

function makeReport(id: string, status: 'pending' | 'progress' | 'resolved' | 'cancelled', title = 'Signalement') {
  return {
    id,
    status,
    type: 'voirie',
    title,
    description: 'Description',
    authorId: 'user-abc123',
    location: null,
    resolvedAt: null,
    resolvedBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };
}

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    reports: [],
    isLoading: false,
    error: null,
    section: 'pending' as const,
    setSection: vi.fn(),
    view: 'table' as const,
    setView: vi.fn(),
    totalCount: 0,
    pendingCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    pendingReports: [],
    historyReports: [],
    updateStatus: vi.fn(),
    ...overrides,
  };
}

describe('ReportsPage', () => {
  it('renders the page title', () => {
    render(<ReportsPage {...makeProps()} />);
    expect(screen.getByText('reports.title')).toBeTruthy();
  });

  it('shows stat counts', () => {
    render(<ReportsPage {...makeProps({ totalCount: 5, pendingCount: 3, inProgressCount: 1, resolvedCount: 1 })} />);
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows empty state when pending reports list is empty', () => {
    render(<ReportsPage {...makeProps({ section: 'pending', pendingReports: [] })} />);
    expect(screen.getByText('reports.empty')).toBeTruthy();
  });

  it('renders a row for each pending report', () => {
    const pendingReports = [makeReport('r1', 'pending', 'Nid de poule'), makeReport('r2', 'progress', 'Lampadaire')];
    render(<ReportsPage {...makeProps({ pendingReports, totalCount: 2, pendingCount: 2 })} />);
    expect(screen.getByText('Nid de poule')).toBeTruthy();
    expect(screen.getByText('Lampadaire')).toBeTruthy();
  });

  it('shows the error banner when error is set', () => {
    render(<ReportsPage {...makeProps({ error: 'Erreur réseau' })} />);
    expect(screen.getByText('reports.error')).toBeTruthy();
  });

  it('renders history reports when section is history', () => {
    const historyReports = [makeReport('r3', 'resolved', 'Graffiti résolu')];
    render(<ReportsPage {...makeProps({ section: 'history', historyReports })} />);
    expect(screen.getByText('Graffiti résolu')).toBeTruthy();
  });
});
