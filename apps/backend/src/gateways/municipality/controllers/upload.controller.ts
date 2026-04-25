import type { Context } from 'hono';
import { Hono } from 'hono';
import type { IUploadService } from '../../../modules/upload/upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export class UploadController {
  constructor(private service: IUploadService) {}

  public getRoutes() {
    const app = new Hono();

    app.post('/image', async (c: Context) => {
      const formData = await c.req.formData();
      const file = formData.get('file');

      if (!(file && file instanceof File)) {
        return c.json({ error: 'Aucun fichier fourni.' }, 400);
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return c.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, 400);
      }

      if (file.size > MAX_SIZE_BYTES) {
        return c.json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' }, 400);
      }

      const buffer = await file.arrayBuffer();
      const url = await this.service.uploadImage(buffer, file.name, file.type);
      return c.json({ url }, 201);
    });

    return app;
  }
}
