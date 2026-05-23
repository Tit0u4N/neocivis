import type { PaginatedReportsResponse, Report, ReportStatus } from '@repo/contracts/report';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class MunicipalityReportService extends AbstractService {
  private cityId: string;

  constructor(kyInstance: KyInstance, cityId: string) {
    super(kyInstance, '');
    this.cityId = cityId;
  }

  async getAll(): Promise<PaginatedReportsResponse> {
    return await this.http.get(`cities/${this.cityId}/reports`).json<PaginatedReportsResponse>();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    return await this.http.patch(`cities/${this.cityId}/reports/${id}/status`, { json: { status } }).json<Report>();
  }
}
