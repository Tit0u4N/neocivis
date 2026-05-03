import type { ApiErrorDto, ImageUploadResponseDto } from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { IUploadService } from '../../../modules/upload/upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export class UploadController {
  constructor(private service: IUploadService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.post('/image', (c) => this.uploadImage(c));

    return app;
  }

  private async uploadImage(c: Context): Promise<ControllerJson<ImageUploadResponseDto, 201>> {
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

    const buffer = await file.arrayBuffer();
    const url = await this.service.uploadImage(buffer, file.name, file.type);
    const body: ImageUploadResponseDto = { url };
    return c.json(body, 201);
  }
}
