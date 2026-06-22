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
  constructor(kyInstance: KyInstance, cityId: string) {
    // Prefix intentionally excludes '/reports': each method passes 'reports/...'
    // explicitly so ky never appends a trailing slash to the resource root URL.
    // (ky always adds a trailing slash to prefixUrl before concatenating the path,
    //  so post('') would resolve to '…/reports/' which Hono does not match.)
    super(kyInstance, { cityId, prefix: '' });
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
    const { uri, fileName, mimeType } = payload.photo;
    const type = mimeType ?? 'image/jpeg';
    if (uri.startsWith('blob:') || uri.startsWith('data:')) {
      // Web: expo-image-picker returns a blob/data URI — fetch it to get a real File
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('photo', new File([blob], fileName, { type }));
    } else {
      // React Native: the native bridge understands { uri, name, type } directly
      formData.append('photo', { uri, name: fileName, type } as unknown as Blob);
    }
    // 'reports' (no trailing slash) → …/cities/{id}/reports  ✓
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

  // --- Municipality ---

  async getAll(): Promise<PaginatedReportsResponse> {
    return await this.http.get('reports').json<PaginatedReportsResponse>();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    return await this.http.patch(`reports/${id}/status`, { json: { status } }).json<Report>();
  }
}
