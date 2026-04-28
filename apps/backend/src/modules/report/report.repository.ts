import type { Report } from '@repo/contracts/report';
import { getMockReports } from './report.mock';
import type { IReportRepository } from './report.types';

export class InMemoryReportRepository implements IReportRepository {
  private seeded = false;
  private reports: Report[] = [];

  private ensureSeeded(): void {
    if (this.seeded) {
      return;
    }
    this.reports = getMockReports();
    this.seeded = true;
  }

  findByAuthor(authorId: string, page: number, limit: number): Promise<{ items: Report[]; total: number }> {
    this.ensureSeeded();
    const own = this.reports.filter((r) => r.authorId === authorId);
    const sorted = [...own].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * limit;
    return Promise.resolve({ items: sorted.slice(start, start + limit), total: own.length });
  }

  findById(id: string): Promise<Report | null> {
    this.ensureSeeded();
    return Promise.resolve(this.reports.find((r) => r.id === id) ?? null);
  }

  create(report: Report): Promise<Report> {
    this.ensureSeeded();
    this.reports.push(report);
    return Promise.resolve(report);
  }

  update(id: string, patch: Partial<Report>): Promise<Report> {
    this.ensureSeeded();
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx === -1) {
      return Promise.reject(new Error(`Report not found: ${id}`));
    }
    this.reports[idx] = { ...this.reports[idx], ...patch };
    return Promise.resolve(this.reports[idx]);
  }
}
