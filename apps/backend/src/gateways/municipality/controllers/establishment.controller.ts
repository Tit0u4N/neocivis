import { CreateEstablishmentInput, UpdateEstablishmentInput } from '@repo/contracts/establishment';
import type { Context } from 'hono';
import { Hono } from 'hono';
import type { EstablishmentService } from '@/modules/establishment/establishment.service';

export class EstablishmentController {
  constructor(private service: EstablishmentService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/all', (c: Context) => {
      return c.json(this.service.list());
    });

    app.get('/:id', (c: Context) => {
      const establishment = this.service.getById(c.req.param('id'));
      if (!establishment) {
        return c.json({ error: 'Establishment not found' }, 404);
      }
      return c.json(establishment);
    });

    app.post('/', async (c: Context) => {
      const body = await c.req.json();
      const parsed = CreateEstablishmentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      const establishment = this.service.create(parsed.data);
      return c.json(establishment, 201);
    });

    app.put('/:id', async (c: Context) => {
      const body = await c.req.json();
      const parsed = UpdateEstablishmentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      const establishment = this.service.update(c.req.param('id'), parsed.data);
      if (!establishment) {
        return c.json({ error: 'Establishment not found' }, 404);
      }
      return c.json(establishment);
    });

    app.delete('/:id', (c: Context) => {
      const deleted = this.service.delete(c.req.param('id'));
      if (!deleted) {
        return c.json({ error: 'Establishment not found' }, 404);
      }
      return c.json({ success: true });
    });

    return app;
  }
}
