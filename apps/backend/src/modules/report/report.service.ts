import { randomUUID } from 'node:crypto';
import type { GpsLocation, PaginatedReportsResponse, Report } from '@repo/contracts/report';
import { REPORT_TYPES } from '@repo/contracts/report';
import type { QwenService } from '@/modules/report/qwen.service';
import type { IReportRepository } from './report.types';

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
  constructor(
    private repo: IReportRepository,
    private qwenService: QwenService,
  ) {}

  async createReport(input: {
    desc: string;
    authorId: string;
    location?: GpsLocation;
    photoUrl: string;
  }): Promise<Report> {
    const now = new Date().toISOString();

    let reportType: (typeof REPORT_TYPES)[number] = 'Autre';
    if (input.photoUrl) {
      try {
        const analysis = await this.qwenService.analyzeReportImage(input.photoUrl);
        if (analysis && (REPORT_TYPES as readonly string[]).includes(analysis)) {
          reportType = analysis as (typeof REPORT_TYPES)[number];
        }
      } catch (_error) {
        // TODO: En production, il faudrait peut-être rendre cette analyse asynchrone
        // (job en arrière-plan) plutôt que de la laisser bloquante au moment de la création.
        // Pour le moment, on continue avec le type par défaut "Autre" en cas d'erreur.
      }
    }
    return this.repo.create({
      id: randomUUID(),
      authorId: input.authorId,
      title: deriveTitle(input.desc),
      type: reportType,
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

  async getReportByIdForUser(id: string, authorId: string): Promise<Report> {
    const report = await this.repo.findById(id);
    if (!report || report.authorId !== authorId) {
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

  analyzeReportImage(photoUrl: string): Promise<string> {
    return this.qwenService.analyzeReportImage(photoUrl);
  }
}
