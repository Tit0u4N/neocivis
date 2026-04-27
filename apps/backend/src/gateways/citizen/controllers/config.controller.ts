import { ConfigQuery } from '@repo/contracts/config';
import type { Context } from 'hono';
import { Hono } from 'hono';
import type { ConfigService } from '@/modules/config/config.service';

export class ConfigController {
  constructor(private configService: ConfigService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/', async (c: Context) => {
      const result = ConfigQuery.safeParse({ locale: c.req.query('locale') });

      if (!result.success) {
        return c.json({ error: 'Invalid query parameters' }, 400);
      }

      return c.json(await this.configService.getConfig(result.data.locale));
    });

    return app;
  }
}
