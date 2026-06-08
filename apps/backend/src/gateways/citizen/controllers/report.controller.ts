import type { ApiErrorDto, ApiErrorWithDetailsDto } from '@repo/contracts';
import {
  CreateReportFormFields,
  type PaginatedReportsResponse,
  type Report,
  ReportsListQuery,
} from '@repo/contracts/report';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ReportService } from '@/modules/report/service/report.service';
import type { IUploadService } from '@/modules/upload/upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class ReportController {
  constructor(
    private reports: ReportService,
    private uploads: IUploadService,
  ) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.post('/', (c) => this.createReport(c));
    app.get('/me', (c) => this.listMyReports(c));
    app.get('/:id', (c) => this.getReportById(c));
    app.patch('/:id/cancel', (c) => this.cancelReport(c));

    return app;
  }

  private async createReport(c: Context): Promise<ControllerJson<Report, 201>> {
    // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
    const user = (c as any).user;
    if (!user) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }

    const formData = await c.req.formData();
    const fields = CreateReportFormFields.safeParse({
      desc: formData.get('desc'),
      latitude: formData.get('latitude') ?? undefined,
      longitude: formData.get('longitude') ?? undefined,
    });
    if (!fields.success) {
      const body: ApiErrorWithDetailsDto = { error: 'Invalid fields', details: fields.error.flatten() };
      return c.json(body, 400);
    }

    const photo = formData.get('photo');
    if (!(photo instanceof File)) {
      return c.json({ error: 'Une photo est obligatoire.' } satisfies ApiErrorDto, 400);
    }
    if (!ALLOWED_TYPES.includes(photo.type)) {
      return c.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' } satisfies ApiErrorDto, 400);
    }
    if (photo.size > MAX_SIZE_BYTES) {
      return c.json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' } satisfies ApiErrorDto, 400);
    }
    const buf = await photo.arrayBuffer();
    const photoUrl = await this.uploads.uploadImage(buf, photo.name, photo.type);

    const { latitude, longitude } = fields.data;
    const location = latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined;

    const report = await this.reports.createReport({
      desc: fields.data.desc,
      authorId: user.id,
      location,
      photoUrl,
    });
    const body: Report = report;
    return c.json(body, 201);
  }

  private async listMyReports(c: Context): Promise<ControllerJson<PaginatedReportsResponse>> {
    // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
    const user = (c as any).var.user;
    if (!user) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }

    const result = ReportsListQuery.safeParse({
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    });
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters' } satisfies ApiErrorDto, 400);
    }

    const { page, limit } = result.data;
    const body: PaginatedReportsResponse = await this.reports.getMyReports(user.id, page, limit);
    return c.json(body, 200);
  }

  private async getReportById(c: Context): Promise<ControllerJson<Report>> {
    // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
    const user = (c as any).user;
    if (!user) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }

    try {
      const report = await this.reports.getReportByIdForUser(c.req.param('id'), user.id);
      const body: Report = report;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Report not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async cancelReport(c: Context): Promise<ControllerJson<Report>> {
    // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
    const user = (c as any).user;
    if (!user) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }

    try {
      const report = await this.reports.cancelReport(c.req.param('id'), user.id);
      const body: Report = report;
      return c.json(body, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'Report not found') {
        return c.json({ error: message } satisfies ApiErrorDto, 404);
      }
      return c.json({ error: message } satisfies ApiErrorDto, 400);
    }
  }
}
