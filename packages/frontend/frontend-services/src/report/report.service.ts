import type { PaginatedReportsResponse, Report, ReportStatus, ReportsListQuery } from '@repo/contracts/report';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export interface CreateReportPayload {
  desc: string;
  latitude?: number;
  longitude?: number;
  photo: { uri: string; fileName: string; mimeType?: string };
}

/**
 * City-scoped reports service shared by both audiences:
 * - citizen app: `create` / `getMine` / `getById` / `cancel`
 * - town-hall portal: `getAll` / `updateStatus`
 *
 * All routes hang off the shared city-scoped router `cities/:cityId/reports`.
 */
export class ReportService extends AbstractService {
  private readonly basePath: string;

  constructor(kyInstance: KyInstance, cityId: string) {
    super(kyInstance, '');
    this.basePath = `cities/${cityId}/reports`;
  }

  // --- Citizen ---

  async create(payload: CreateReportPayload): Promise<Report> {
    const formData = new FormData();
    formData.append('desc', payload.desc);
    if (payload.latitude !== undefined) {
      formData.append('latitude', String(payload.latitude));
    }
    if (payload.longitude !== undefined) {
      formData.append('longitude', String(payload.longitude));
    }
    // Expo RN accepts { uri, name, type } as a File-compatible value in FormData
    formData.append('photo', {
      uri: payload.photo.uri,
      name: payload.photo.fileName,
      type: payload.photo.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
    return await this.http
      .extend({ headers: { 'Content-Type': undefined } })
      .post(this.basePath, { body: formData })
      .json<Report>();
  }

  async getMine(query: Partial<ReportsListQuery> = {}): Promise<PaginatedReportsResponse> {
    const searchParams: Record<string, string | number> = {};
    if (query.page !== undefined) {
      searchParams.page = query.page;
    }
    if (query.limit !== undefined) {
      searchParams.limit = query.limit;
    }
    return await this.http.get(`${this.basePath}/me`, { searchParams }).json<PaginatedReportsResponse>();
  }

  async getById(id: string): Promise<Report> {
    return await this.http.get(`${this.basePath}/${id}`).json<Report>();
  }

  async cancel(id: string): Promise<Report> {
    return await this.http.patch(`${this.basePath}/${id}/cancel`).json<Report>();
  }

  // --- Municipality ---

  async getAll(): Promise<PaginatedReportsResponse> {
    return await this.http.get(this.basePath).json<PaginatedReportsResponse>();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    return await this.http.patch(`${this.basePath}/${id}/status`, { json: { status } }).json<Report>();
  }
}
