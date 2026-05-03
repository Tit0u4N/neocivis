import type { ApiErrorDto, UserMeDto, UserPublicDto } from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { UserService } from '@/modules/users/service/user.service';
import { toUserMeDto, toUserPublicDto } from '@/modules/users/user.types';

export class UserController {
  constructor(private service: UserService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/me', (c) => this.getMe(c));
    app.get('/by-ids', (c) => this.getUsersByIds(c));

    return app;
  }

  private async getUsersByIds(c: Context): Promise<ControllerJson<UserPublicDto[]>> {
    const idsParam = c.req.query('ids');
    if (!idsParam) {
      return c.json({ error: 'Missing ids query param' } satisfies ApiErrorDto, 400);
    }

    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));

    if (ids.length === 0 || !ids.every(Number.isFinite)) {
      return c.json({ error: 'Invalid ids' } satisfies ApiErrorDto, 400);
    }

    const users = await this.service.getByIds(ids);
    const body: UserPublicDto[] = users.map(toUserPublicDto);
    return c.json(body, 200);
  }

  private async getMe(c: Context): Promise<ControllerJson<UserMeDto>> {
    const keycloakId = c.req.header('X-User-Id');
    if (!keycloakId) {
      return c.json({ error: 'No user information found in headers' } satisfies ApiErrorDto, 400);
    }
    const user = await this.service.getByKeycloakId(keycloakId);
    if (!user) {
      return c.json({ error: 'User not found' } satisfies ApiErrorDto, 404);
    }
    const body: UserMeDto = toUserMeDto(user);
    return c.json(body, 200);
  }
}
