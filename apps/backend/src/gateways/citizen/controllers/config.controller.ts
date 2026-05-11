import type { ApiErrorDto, CitizenConfigResponse } from '@repo/contracts';
import { ConfigQuery } from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ConfigService } from '@/modules/config/service/config.service';

export class ConfigController {
  constructor(private configService: ConfigService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/city/:cityId/:locale', (c) => this.getConfig(c));

    return app;
  }

  private async getConfig(c: Context): Promise<ControllerJson<CitizenConfigResponse>> {
    const { cityId, locale } = c.req.param();
    const result = ConfigQuery.safeParse({ locale });

    if (!result.success) {
      return c.json({ error: 'Invalid query parameters' } satisfies ApiErrorDto, 400);
    }

    const body: CitizenConfigResponse = await this.configService.getConfig(cityId, result.data.locale);
    return c.json(body, 200);
  }
}
