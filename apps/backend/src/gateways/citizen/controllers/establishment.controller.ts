import type { ApiErrorDto } from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { EstablishmentService } from '@/modules/establishment/service/establishment.service';

export class EstablishmentController {
  constructor(private service: EstablishmentService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/all', (c) => this.list(c));
    app.get('/:id', (c) => this.getById(c));

    return app;
  }

  private async list(c: Context): Promise<ControllerJson> {
    const cityId = c.req.param('cityId') ?? '';
    return c.json(await this.service.list(cityId), 200);
  }

  private async getById(c: Context): Promise<ControllerJson> {
    const cityId = c.req.param('cityId') ?? '';
    const establishment = await this.service.getById(cityId, c.req.param('id'));
    if (!establishment) {
      return c.json({ error: 'Establishment not found' } satisfies ApiErrorDto, 404);
    }
    return c.json(establishment, 200);
  }
}
