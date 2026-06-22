import { randomUUID } from 'node:crypto';
import type { GpsLocation, PaginatedReportsResponse, Report, ReportStatus, ReportType } from '@repo/contracts/report';
import type { IReportRepository } from '../repository/report.repository.interface';

function deriveTitle(desc: string, maxLen = 60): string {
  const trimmed = desc.trim();
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  const cut = trimmed.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

export class ReportService {
  constructor(private readonly repo: IReportRepository) {}

  createReport(input: { desc: string; authorId: string; cityId: string; location?: GpsLocation; photoUrl: string; type?: ReportType }): Promise<Report> {
    const now = new Date().toISOString();
    return this.repo.create({
      id: randomUUID(),
      authorId: input.authorId,
      cityId: input.cityId,
      title: deriveTitle(input.desc),
      type: input.type ?? 'Autre',
      status: 'pending',
      desc: input.desc,
      photoUrl: input.photoUrl,
      location: input.location,
      createdAt: now,
      updatedAt: now,
    });
  }

  async getMyReports(authorId: string, page: number, limit: number): Promise<PaginatedReportsResponse> {
    const { items, total } = await this.repo.findByAuthor(authorId, page, limit);
    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --- Municipality (city-scoped, not author-scoped) ---

  async getCityReports(cityId: string, page: number, limit: number): Promise<PaginatedReportsResponse> {
    const { items, total } = await this.repo.findByCityId(cityId, page, limit);
    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(cityId: string, id: string, status: ReportStatus): Promise<Report> {
    const report = await this.repo.findById(id);
    if (!report || report.cityId !== cityId) {
      throw new Error('Report not found');
    }
    const now = new Date().toISOString();
    const patch: Partial<Report> = { status, updatedAt: now };
    if (status === 'resolved') {
      patch.resolvedAt = now;
    }
    return this.repo.update(id, patch);
  }

  // --- Citizen (author-scoped) ---

  async getReportByIdForUser(id: string, authorId: string): Promise<Report> {
    const report = await this.repo.findById(id);
    if (report?.authorId !== authorId) {
      throw new Error('Report not found');
    }
    return report;
  }

  async cancelReport(id: string, authorId: string): Promise<Report> {
    const report = await this.getReportByIdForUser(id, authorId);
    if (report.status === 'resolved' || report.status === 'cancelled') {
      throw new Error('Cannot cancel a report that is resolved or already cancelled');
    }
    return this.repo.update(id, { status: 'cancelled', updatedAt: new Date().toISOString() });
  }
}
