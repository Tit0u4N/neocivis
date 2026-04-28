import type { Report } from '@repo/contracts/report';

export interface IReportRepository {
  findByAuthor(authorId: string, page: number, limit: number): Promise<{ items: Report[]; total: number }>;
  findById(id: string): Promise<Report | null>;
  create(report: Report): Promise<Report>;
  update(id: string, patch: Partial<Report>): Promise<Report>;
}
