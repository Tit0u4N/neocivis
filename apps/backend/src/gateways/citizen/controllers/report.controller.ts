import { CreateReportFormFields, ReportsListQuery } from '@repo/contracts/report';
import type { Context } from 'hono';
import { Hono } from 'hono';
import type { ReportService } from '@/modules/report/report.service';
import type { IUploadService } from '@/modules/upload/upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class ReportController {
  constructor(
    private reports: ReportService,
    private uploads: IUploadService,
  ) {}

  public getRoutes() {
    const app = new Hono();

    /**
     * Path: POST /reports
     * Description: Create a new report. Accepts multipart/form-data with fields:
     */
    app.post('/', async (c: Context) => {
      // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
      const user = (c as any).user;
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const formData = await c.req.formData();
      const fields = CreateReportFormFields.safeParse({
        desc: formData.get('desc'),
        latitude: formData.get('latitude') ?? undefined,
        longitude: formData.get('longitude') ?? undefined,
      });
      if (!fields.success) {
        return c.json({ error: 'Invalid fields', details: fields.error.flatten() }, 400);
      }

      const photo = formData.get('photo');
      if (!(photo instanceof File)) {
        return c.json({ error: 'Une photo est obligatoire.' }, 400);
      }
      if (!ALLOWED_TYPES.includes(photo.type)) {
        return c.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, 400);
      }
      if (photo.size > MAX_SIZE_BYTES) {
        return c.json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' }, 400);
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
      return c.json(report, 201);
    });

    app.get('/me', async (c: Context) => {
      // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
      const user = (c as any).user;
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const result = ReportsListQuery.safeParse({
        page: c.req.query('page'),
        limit: c.req.query('limit'),
      });
      if (!result.success) {
        return c.json({ error: 'Invalid query parameters' }, 400);
      }

      const { page, limit } = result.data;
      return c.json(await this.reports.getMyReports(user.id, page, limit));
    });

    app.get('/:id', async (c: Context) => {
      // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
      const user = (c as any).user;
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      try {
        const report = await this.reports.getReportByIdForUser(c.req.param('id'), user.id);
        return c.json(report);
      } catch {
        return c.json({ error: 'Report not found' }, 404);
      }
    });

    app.patch('/:id/cancel', async (c: Context) => {
      // biome-ignore lint/suspicious/noExplicitAny: user set by auth middleware on context
      const user = (c as any).user;
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      try {
        const report = await this.reports.cancelReport(c.req.param('id'), user.id);
        return c.json(report);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'Report not found') {
          return c.json({ error: message }, 404);
        }
        return c.json({ error: message }, 400);
      }
    });

    return app;
  }
}
