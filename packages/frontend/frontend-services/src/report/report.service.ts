import type { PaginatedReportsResponse, Report, ReportsListQuery } from '@repo/contracts/report';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export interface CreateReportPayload {
  desc: string;
  latitude?: number;
  longitude?: number;
  photo?: { uri: string; fileName: string; mimeType?: string };
}

export class ReportService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, '');
  }

  async create(payload: CreateReportPayload): Promise<Report> {
    const formData = new FormData();
    formData.append('desc', payload.desc);
    if (payload.latitude !== undefined) {
      formData.append('latitude', String(payload.latitude));
    }
    if (payload.longitude !== undefined) {
      formData.append('longitude', String(payload.longitude));
    }
    if (payload.photo) {
      // Expo RN accepts { uri, name, type } as a File-compatible value in FormData
      formData.append('photo', {
        uri: payload.photo.uri,
        name: payload.photo.fileName,
        type: payload.photo.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
    }
    return await this.http
      .extend({ headers: { 'Content-Type': undefined } })
      .post('reports', { body: formData })
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
    return await this.http.get('reports/me', { searchParams }).json<PaginatedReportsResponse>();
  }

  async getById(id: string): Promise<Report> {
    return await this.http.get(`reports/${id}`).json<Report>();
  }

  async cancel(id: string): Promise<Report> {
    return await this.http.patch(`reports/${id}/cancel`).json<Report>();
  }
}
