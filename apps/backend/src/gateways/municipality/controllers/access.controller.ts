import type { ApiErrorDto, EmployeeRolesDto, OperationSuccessDto, PermissionDto, RoleDto } from '@repo/contracts';
import { CreateRoleInput as CreateRoleInputSchema, UpdateRoleInput as UpdateRoleInputSchema } from '@repo/contracts/role';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { AccessService, CreateRoleServiceInput } from '@/modules/access/access.service';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';
import { requireCityAdmin } from '@/middlewares/permission.middleware';

export class AccessController {
  constructor(
    private accessService: AccessService,
    private cityService: CityService,
    private userService: UserService,
  ) {}

  /** Routes ADMIN-only : à monter sous `/cities/:cityId`. */
  public getCityScopedRoutes(): Hono {
    const app = new Hono();
    app.use('*', requireCityAdmin(this.cityService, this.userService));

    app.get('/roles', (c) => this.listRoles(c));
    app.post('/roles', (c) => this.createRole(c));
    app.get('/roles/:roleId', (c) => this.getRole(c));
    app.put('/roles/:roleId', (c) => this.updateRole(c));
    app.delete('/roles/:roleId', (c) => this.deleteRole(c));

    app.get('/employees/:userId/roles', (c) => this.listEmployeeRoles(c));
    app.post('/employees/:userId/roles/:roleId', (c) => this.assignRole(c));
    app.delete('/employees/:userId/roles/:roleId', (c) => this.unassignRole(c));

    return app;
  }

  /** Catalogue (read-only) accessible aux EMPLOYEE/ADMIN. */
  public getCatalogRoutes(): Hono {
    const app = new Hono();
    app.get('/', (c) => this.listPermissionCatalog(c));
    return app;
  }

  private async listPermissionCatalog(c: Context): Promise<ControllerJson<PermissionDto[], 200, readonly []>> {
    const body: PermissionDto[] = await this.accessService.listPermissionCatalog();
    return c.json(body, 200);
  }

  private async listRoles(c: Context): Promise<ControllerJson<RoleDto[], 200, readonly []>> {
    const cityId = c.req.param('cityId');
    const body: RoleDto[] = await this.accessService.listRolesForCity(cityId);
    return c.json(body, 200);
  }

  private async createRole(c: Context): Promise<ControllerJson<RoleDto, 201>> {
    const cityId = c.req.param('cityId');
    const json = await c.req.json().catch(() => null);
    const parsed = CreateRoleInputSchema.safeParse(json);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const d = parsed.data;
      const payload: CreateRoleServiceInput = {
        name: d.name,
        description: d.description ?? '',
        permissions: d.permissions,
      };
      const role = await this.accessService.createRole(cityId, payload);
      return c.json(role, 201);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Create failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }
  }

  private async getRole(c: Context): Promise<ControllerJson<RoleDto>> {
    const cityId = c.req.param('cityId');
    const roleId = c.req.param('roleId');
    const role = await this.accessService.getRole(cityId, roleId);
    if (!role) {
      return c.json({ error: 'Role not found' } satisfies ApiErrorDto, 404);
    }
    return c.json(role, 200);
  }

  private async updateRole(c: Context): Promise<ControllerJson<RoleDto>> {
    const cityId = c.req.param('cityId');
    const roleId = c.req.param('roleId');
    const json = await c.req.json().catch(() => null);
    const parsed = UpdateRoleInputSchema.safeParse(json);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const role = await this.accessService.updateRole(cityId, roleId, parsed.data);
      return c.json(role, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      const status = msg === 'Role not found' ? 404 : 409;
      return c.json({ error: msg } satisfies ApiErrorDto, status);
    }
  }

  private async deleteRole(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const roleId = c.req.param('roleId');
    try {
      await this.accessService.deleteRole(cityId, roleId);
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 404);
    }
  }

  private async listEmployeeRoles(c: Context): Promise<ControllerJson<EmployeeRolesDto>> {
    const cityId = c.req.param('cityId');
    const userId = Number(c.req.param('userId'));
    if (!Number.isFinite(userId)) {
      return c.json({ error: 'Invalid userId' } satisfies ApiErrorDto, 400);
    }
    try {
      const body = await this.accessService.listEmployeeRoles(cityId, userId);
      return c.json(body, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lookup failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 404);
    }
  }

  private async assignRole(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const userId = Number(c.req.param('userId'));
    const roleId = c.req.param('roleId');
    if (!Number.isFinite(userId)) {
      return c.json({ error: 'Invalid userId' } satisfies ApiErrorDto, 400);
    }
    try {
      await this.accessService.assignRole(cityId, userId, roleId);
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Assign failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }
  }

  private async unassignRole(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = c.req.param('cityId');
    const userId = Number(c.req.param('userId'));
    const roleId = c.req.param('roleId');
    if (!Number.isFinite(userId)) {
      return c.json({ error: 'Invalid userId' } satisfies ApiErrorDto, 400);
    }
    try {
      await this.accessService.unassignRole(cityId, userId, roleId);
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unassign failed';
      return c.json({ error: msg } satisfies ApiErrorDto, 409);
    }
  }
}
