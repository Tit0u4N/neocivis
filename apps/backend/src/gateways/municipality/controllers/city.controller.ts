import type { ApiErrorDto, CityPublicDto, OperationSuccessDto, UserPublicDto } from '@repo/contracts';
import { UpdateCityInput as UpdateCityInputSchema } from '@repo/contracts/city';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';
import { toUserPublicDto } from '@/modules/users/user.types';

export class CityController {
  constructor(
    private cityService: CityService,
    private userService: UserService,
  ) {}

  public getRoutes(): Hono {
    const app = new Hono();
    app.patch('/:cityId', (c) => this.patchCity(c));
    app.get('/:cityId/citizens', (c) => this.listCitizens(c));
    app.get('/:cityId/employees', (c) => this.listEmployees(c));
    app.post('/:cityId/employees', (c) => this.createAndAssignEmployee(c));
    app.delete('/:cityId/employees/:userId', (c) => this.unassignEmployee(c));
    return app;
  }

  private async patchCity(c: Context): Promise<ControllerJson<CityPublicDto>> {
    const cityId = c.req.param('cityId');
    const json = await c.req.json().catch(() => null);
    const parsed = UpdateCityInputSchema.safeParse(json);
    if (!parsed.success) {
      return c.json({ error: 'Invalid body' } satisfies ApiErrorDto, 400);
    }
    try {
      const updated = await this.cityService.updateCityDescription(cityId, parsed.data.description);
      return c.json(updated, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 404);
    }
  }

  private async listCitizens(c: Context): Promise<ControllerJson<UserPublicDto[]>> {
    const cityId = c.req.param('cityId');
    const ids = await this.cityService.listCitizens(cityId);
    const users = await this.userService.getByIds(ids);
    const body: UserPublicDto[] = users.map(toUserPublicDto);
    return c.json(body, 200);
  }

  private async listEmployees(c: Context): Promise<ControllerJson<UserPublicDto[]>> {
    const cityId = c.req.param('cityId');
    const ids = await this.cityService.listEmployees(cityId);
    const users = await this.userService.getByIds(ids);
    const body: UserPublicDto[] = users.map(toUserPublicDto);
    return c.json(body, 200);
  }

  private async createAndAssignEmployee(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const json = await c.req.json().catch(() => null);
    const bodyObj = json as null | Record<string, unknown>;
    const username = typeof bodyObj?.username === 'string' ? bodyObj.username : '';
    const email = typeof bodyObj?.email === 'string' ? bodyObj.email : '';
    const firstName = typeof bodyObj?.firstName === 'string' ? bodyObj.firstName : '';
    const lastName = typeof bodyObj?.lastName === 'string' ? bodyObj.lastName : '';
    if (!(username && email && firstName && lastName)) {
      return c.json({ error: 'Invalid body' } satisfies ApiErrorDto, 400);
    }

    try {
      await this.cityService.createAndAssignEmployee(cityId, { username, email, firstName, lastName });
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Assign failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }
  }

  private async unassignEmployee(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const rawUserId = c.req.param('userId');
    const userId = Number(rawUserId);
    if (!Number.isFinite(userId)) {
      return c.json({ error: 'Invalid userId' } satisfies ApiErrorDto, 400);
    }
    try {
      await this.cityService.unassignEmployeeAndDeleteIam(cityId, userId);
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unassign failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }
  }
}
