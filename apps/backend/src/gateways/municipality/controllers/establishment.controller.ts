import { CreateEstablishmentInput, UpdateEstablishmentInput } from '@repo/contracts/establishment';
import { type Context, Hono } from 'hono';
import type { EstablishmentService } from '@/modules/establishment/service/establishment.service';

export class EstablishmentController {
  constructor(private service: EstablishmentService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/all', async (c: Context) => {
      const cityId = c.req.param('cityId') ?? '';
      return c.json(await this.service.list(cityId));
    });

    app.get('/:id', async (c: Context) => {
      const cityId = c.req.param('cityId') ?? '';
      const establishment = await this.service.getById(cityId, c.req.param('id'));
      if (!establishment) {
        return c.json({ error: 'Establishment not found' }, 404);
      }
      return c.json(establishment);
    });

    app.post('/', async (c: Context) => {
      const cityId = c.req.param('cityId') ?? '';
      const body = await c.req.json();
      const parsed = CreateEstablishmentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      const establishment = await this.service.create(cityId, parsed.data);
      return c.json(establishment, 201);
    });

    app.put('/:id', async (c: Context) => {
      const cityId = c.req.param('cityId') ?? '';
      const body = await c.req.json();
      const parsed = UpdateEstablishmentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      const establishment = await this.service.update(cityId, c.req.param('id'), parsed.data);
      if (!establishment) {
        return c.json({ error: 'Establishment not found' }, 404);
      }
      return c.json(establishment);
    });

    app.delete('/:id', async (c: Context) => {
      const cityId = c.req.param('cityId') ?? '';
      const deleted = await this.service.delete(cityId, c.req.param('id'));
      if (!deleted) {
        return c.json({ error: 'Establishment not found' }, 404);
      }
      return c.json({ success: true });
    });

    return app;
  }
}
