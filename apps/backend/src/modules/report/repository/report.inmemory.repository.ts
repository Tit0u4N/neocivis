import type { Report } from '@repo/contracts/report';
import type { IReportRepository } from './report.repository.interface';

export class InMemoryReportRepository implements IReportRepository {
  private reports: Report[] = [];

  findByAuthor(authorId: string, page: number, limit: number): Promise<{ items: Report[]; total: number }> {
    const own = this.reports.filter((r) => r.authorId === authorId);
    const sorted = [...own].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * limit;
    return Promise.resolve({ items: sorted.slice(start, start + limit), total: own.length });
  }

  findByCityId(cityId: string, page: number, limit: number): Promise<{ items: Report[]; total: number }> {
    const own = this.reports.filter((r) => r.cityId === cityId);
    const sorted = [...own].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * limit;
    return Promise.resolve({ items: sorted.slice(start, start + limit), total: own.length });
  }

  findById(id: string): Promise<Report | null> {
    return Promise.resolve(this.reports.find((r) => r.id === id) ?? null);
  }

  create(report: Report): Promise<Report> {
    this.reports.push(report);
    return Promise.resolve(report);
  }

  update(id: string, patch: Partial<Report>): Promise<Report> {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Report not found: ${id}`);
    }
    this.reports[idx] = { ...this.reports[idx], ...patch };
    return Promise.resolve(this.reports[idx]);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async deleteAll(): Promise<void> {
    this.reports = [];
  }
}
