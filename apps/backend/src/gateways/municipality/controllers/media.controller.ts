import type { ApiErrorDto, MediaImage } from '@repo/contracts';
import { type Context, Hono, type TypedResponse } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { MediaService } from '@/modules/media/service/media.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class MediaController {
  constructor(private readonly service: MediaService) {}

  getRoutes(): Hono {
    const app = new Hono();

    app.get('/city/:cityId', (c) => this.getAll(c));
    app.post('/city/:cityId/upload', (c) => this.upload(c));
    app.delete('/:id', (c) => this.deleteMedia(c));

    return app;
  }

  private async getAll(c: Context): Promise<ControllerJson<MediaImage[], 200, readonly []>> {
    const cityId = c.req.param('cityId');
    const media = await this.service.getAllByCityId(cityId);
    return c.json(media, 200);
  }

  private async upload(c: Context): Promise<ControllerJson<MediaImage, 201>> {
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!(file && file instanceof File)) {
      return c.json({ error: 'Aucun fichier fourni.' } satisfies ApiErrorDto, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' } satisfies ApiErrorDto, 400);
    }

    if (file.size > MAX_SIZE_BYTES) {
      return c.json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' } satisfies ApiErrorDto, 400);
    }

    const cityId = c.req.param('cityId');
    const rawTitle = formData.get('title');
    const title = typeof rawTitle === 'string' ? rawTitle.trim() || undefined : undefined;
    const buffer = await file.arrayBuffer();
    const media = await this.service.upload(cityId, buffer, file.name, file.type, title);
    return c.json(media, 201);
  }

  private async deleteMedia(c: Context): Promise<Response & TypedResponse<null, 204, 'body'>> {
    const id = c.req.param('id');
    try {
      await this.service.delete(id);
      return c.body(null, 204);
    } catch {
      // @ts-expect-error
      return c.json({ error: `Media non trouvé: ${id}` } satisfies ApiErrorDto, 404);
    }
  }
}
