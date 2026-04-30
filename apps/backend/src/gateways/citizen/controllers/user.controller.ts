import { type Context, Hono } from 'hono';
import type { UserService } from '@/modules/users/service/user.service';
import { toUserPublicDto } from '@/modules/users/user.dto';

export class UserController {
  constructor(private service: UserService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/me', async (c) => this.getMe(c));
    app.get('/by-ids', async (c) => this.getUsersByIds(c));

    return app;
  }

  private async getUsersByIds(c: Context) {
    const idsParam = c.req.query('ids');
    if (!idsParam) {
      return c.json({ error: 'Missing ids query param' }, 400);
    }

    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));

    if (ids.length === 0 || !ids.every(Number.isFinite)) {
      return c.json({ error: 'Invalid ids' }, 400);
    }

    const users = await this.service.getByIds(ids);
    return c.json(users.map(toUserPublicDto));
  }

  private async getMe(c: Context) {
    const keycloakId = c.req.header('X-User-Id');
    if (!keycloakId) {
      return c.json({ error: 'No user information found in headers' }, 400);
    }
    const user = await this.service.getByKeycloakId(keycloakId);
    return user ? c.json(user) : c.json({ error: 'User not found' }, 404);
  }
}
