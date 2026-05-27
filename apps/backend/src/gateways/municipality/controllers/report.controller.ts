import type { ApiErrorDto } from '@repo/contracts';
import { type PaginatedReportsResponse, type Report, ReportStatus, ReportsListQuery } from '@repo/contracts/report';
import { type Context, Hono } from 'hono';
import { z } from 'zod';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ReportService } from '@/modules/report/service/report.service';

const UpdateReportStatusBody = z.object({ status: ReportStatus });

/**
 * Municipality-side reports controller: city-scoped listing (NOT author-scoped)
 * and status updates for municipal staff. Mounted under `/cities/:cityId/reports`.
 */
export class ReportController {
  constructor(private reports: ReportService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/', (c) => this.listReports(c));
    app.patch('/:id/status', (c) => this.updateStatus(c));

    return app;
  }

  private async listReports(c: Context): Promise<ControllerJson<PaginatedReportsResponse>> {
    const cityId = c.req.param('cityId') ?? '';
    const result = ReportsListQuery.safeParse({
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    });
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters' } satisfies ApiErrorDto, 400);
    }

    const { page, limit } = result.data;
    const body: PaginatedReportsResponse = await this.reports.getCityReports(cityId, page, limit);
    return c.json(body, 200);
  }

  private async updateStatus(c: Context): Promise<ControllerJson<Report>> {
    const cityId = c.req.param('cityId') ?? '';
    const parsed = UpdateReportStatusBody.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'Invalid status' } satisfies ApiErrorDto, 400);
    }

    try {
      const report = await this.reports.updateStatus(cityId, c.req.param('id'), parsed.data.status);
      const body: Report = report;
      return c.json(body, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: message } satisfies ApiErrorDto, message === 'Report not found' ? 404 : 400);
    }
  }
}
