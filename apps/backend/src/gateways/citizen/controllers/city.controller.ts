import type { ApiErrorDto, CityPublicDto, OperationSuccessDto } from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';

export class CityController {
  constructor(
    private cityService: CityService,
    private userService: UserService,
  ) {}

  public getRoutes(): Hono {
    const app = new Hono();
    app.get('/', (c) => this.listCities(c));
    app.post('/:cityId/join', (c) => this.join(c));
    app.delete('/:cityId/leave', (c) => this.leave(c));
    return app;
  }

  private async listCities(c: Context): Promise<ControllerJson<CityPublicDto[]>> {
    const body = await this.cityService.listPublicCities();
    return c.json(body, 200);
  }

  private async join(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const keycloakId = c.req.header('X-User-Id');
    if (!keycloakId) {
      return c.json({ error: 'No user information found in headers' } satisfies ApiErrorDto, 400);
    }

    const city = await this.cityService.getCityPublicById(cityId);
    if (!city) {
      return c.json({ error: 'City not found' } satisfies ApiErrorDto, 404);
    }

    const user = await this.userService.getByKeycloakId(keycloakId);
    if (!user) {
      return c.json({ error: 'User not found' } satisfies ApiErrorDto, 404);
    }

    try {
      await this.cityService.joinCity(cityId, user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Join failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }

    return c.json({ success: true } satisfies OperationSuccessDto, 200);
  }

  private async leave(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const keycloakId = c.req.header('X-User-Id');
    if (!keycloakId) {
      return c.json({ error: 'No user information found in headers' } satisfies ApiErrorDto, 400);
    }

    const user = await this.userService.getByKeycloakId(keycloakId);
    if (!user) {
      return c.json({ error: 'User not found' } satisfies ApiErrorDto, 404);
    }

    try {
      await this.cityService.leaveCity(cityId, user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Leave failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }

    return c.json({ success: true } satisfies OperationSuccessDto, 200);
  }
}
