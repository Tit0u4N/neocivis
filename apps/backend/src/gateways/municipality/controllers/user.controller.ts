import type { ApiErrorDto, PermissionKey, RoleSummaryDto, UserMeDto, UserPublicDto } from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { AccessService } from '@/modules/access/access.service';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';
import { toUserMeDto, toUserPublicDto } from '@/modules/users/user.types';

export class UserController {
  constructor(
    private service: UserService,
    private cityService: CityService,
    private accessService: AccessService,
  ) {}

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
    const base: UserMeDto = toUserMeDto(user);

    if (user.role === 'CITIZEN') {
      const memberships = await this.cityService.listCitizenMembershipsPublic(user.id);
      const body: UserMeDto = { ...base, memberships, city: undefined };
      return c.json(body, 200);
    }

    const cityId = await this.cityService.getScopedCityForAdminOrEmployee(user.id);
    const city = cityId ? await this.cityService.getCityPublicById(cityId) : null;

    let permissions: PermissionKey[] = [];
    let roles: RoleSummaryDto[] = [];
    if (cityId) {
      permissions = await this.accessService.listEffectivePermissions(user, cityId);
      roles = await this.accessService.listRoleSummariesForUserInCity(user, cityId);
    }

    const body: UserMeDto = {
      ...base,
      city: city ?? undefined,
      memberships: [],
      permissions,
      roles,
    };
    return c.json(body, 200);
  }
}
