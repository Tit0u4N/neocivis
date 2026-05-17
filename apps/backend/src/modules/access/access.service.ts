import type { CityId, EmployeeRolesDto, PermissionDto, PermissionKey, RoleDto, RoleSummaryDto } from '@repo/contracts';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';
import type { User } from '@/modules/users/user.types';
import { toRoleDto, toRoleSummaryDto } from './access.types';
import { isValidPermissionKey, PERMISSION_CATALOG } from './permission.catalog';
import type { IAccessRepository } from './repository/access.repository.interface';

export type CreateRoleServiceInput = Readonly<{
  name: string;
  description: string;
  permissions: PermissionKey[];
}>;

export type UpdateRoleServiceInput = Readonly<{
  name?: string;
  description?: string;
  permissions?: PermissionKey[];
}>;

export class AccessService {
  constructor(
    private repository: IAccessRepository,
    private cityService: CityService,
    private userService: UserService,
  ) {}

  /** Catalogue ----------------------------------------------------------- */

  // biome-ignore lint/suspicious/useAwait: API uniforme avec les autres services
  async listPermissionCatalog(): Promise<PermissionDto[]> {
    return PERMISSION_CATALOG.map((key) => ({ key }));
  }

  /** Roles --------------------------------------------------------------- */

  async listRolesForCity(cityId: CityId): Promise<RoleDto[]> {
    const roles = await this.repository.listRolesByCity(cityId);
    return roles.map(toRoleDto);
  }

  async getRole(cityId: CityId, roleId: string): Promise<RoleDto | null> {
    const role = await this.repository.getRoleById(roleId);
    if (!role || role.cityId !== cityId) {
      return null;
    }
    return toRoleDto(role);
  }

  async createRole(cityId: CityId, input: CreateRoleServiceInput): Promise<RoleDto> {
    this.assertPermissionsExist(input.permissions);
    const trimmedName = input.name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Role name is required');
    }
    const existing = await this.repository.findRoleByCityAndName(cityId, trimmedName);
    if (existing) {
      throw new Error(`A role named "${trimmedName}" already exists in this city`);
    }
    const role = await this.repository.createRole({
      cityId,
      name: trimmedName,
      description: input.description ?? '',
      permissions: dedupe(input.permissions),
    });
    return toRoleDto(role);
  }

  async updateRole(cityId: CityId, roleId: string, input: UpdateRoleServiceInput): Promise<RoleDto> {
    const current = await this.repository.getRoleById(roleId);
    if (!current || current.cityId !== cityId) {
      throw new Error('Role not found');
    }

    let nextName: string | undefined;
    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (trimmed.length === 0) {
        throw new Error('Role name cannot be empty');
      }
      if (trimmed !== current.name) {
        const collision = await this.repository.findRoleByCityAndName(cityId, trimmed);
        if (collision && collision.id !== roleId) {
          throw new Error(`A role named "${trimmed}" already exists in this city`);
        }
      }
      nextName = trimmed;
    }

    if (input.permissions !== undefined) {
      this.assertPermissionsExist(input.permissions);
    }

    const updated = await this.repository.updateRole(roleId, {
      name: nextName,
      description: input.description,
      permissions: input.permissions !== undefined ? dedupe(input.permissions) : undefined,
    });
    return toRoleDto(updated);
  }

  /**
   * Suppression d'un rôle : cascade. Les affectations aux employés sont
   * supprimées via la contrainte FK `ON DELETE CASCADE` (ou en mémoire dans
   * le repo in-memory). Les employés concernés perdent ce rôle silencieusement.
   */
  async deleteRole(cityId: CityId, roleId: string): Promise<void> {
    const current = await this.repository.getRoleById(roleId);
    if (!current || current.cityId !== cityId) {
      throw new Error('Role not found');
    }
    await this.repository.deleteRole(roleId);
  }

  /** Assignments --------------------------------------------------------- */

  async listEmployeeRoles(cityId: CityId, userId: number): Promise<EmployeeRolesDto> {
    const employee = await this.userService.getById(userId);
    if (!employee || employee.role !== 'EMPLOYEE') {
      throw new Error('Target user is not an employee');
    }
    const employeeCityId = await this.cityService.getScopedCityForAdminOrEmployee(userId);
    if (employeeCityId !== cityId) {
      throw new Error('Employee is not assigned to this city');
    }

    const assignments = await this.repository.listAssignmentsByUserId(userId);
    if (assignments.length === 0) {
      return { userId, cityId, roles: [] };
    }
    const roles: RoleDto[] = [];
    for (const a of assignments) {
      const role = await this.repository.getRoleById(a.roleId);
      if (role && role.cityId === cityId) {
        roles.push(toRoleDto(role));
      }
    }
    return { userId, cityId, roles };
  }

  async assignRole(cityId: CityId, userId: number, roleId: string): Promise<void> {
    await this.assertEmployeeOfCity(cityId, userId);
    const role = await this.repository.getRoleById(roleId);
    if (!role || role.cityId !== cityId) {
      throw new Error('Role not found in this city');
    }
    await this.repository.addAssignment(userId, roleId);
  }

  async unassignRole(cityId: CityId, userId: number, roleId: string): Promise<void> {
    await this.assertEmployeeOfCity(cityId, userId);
    const role = await this.repository.getRoleById(roleId);
    if (!role || role.cityId !== cityId) {
      throw new Error('Role not found in this city');
    }
    await this.repository.removeAssignment(userId, roleId);
  }

  /** Permissions checks -------------------------------------------------- */

  /**
   * `true` si l'utilisateur a la permission demandée pour la city ciblée.
   * Règles :
   *  - ADMIN de la city  -> bypass (true)
   *  - EMPLOYEE de la city -> true ssi un de ses rôles dans cette city contient la permission
   *  - Sinon              -> false
   */
  async userHasPermission(user: User, cityId: CityId, permissionKey: PermissionKey): Promise<boolean> {
    if (user.role === 'ADMIN') {
      const isAdminOfCity = (await this.cityService.getScopedCityForAdminOrEmployee(user.id)) === cityId;
      return isAdminOfCity;
    }
    if (user.role !== 'EMPLOYEE') {
      return false;
    }
    const isStaff = await this.cityService.isStaffOfCity(cityId, user.id);
    if (!isStaff) {
      return false;
    }
    const perms = await this.repository.listPermissionsForUserInCity(user.id, cityId);
    return perms.includes(permissionKey);
  }

  async listEffectivePermissions(user: User, cityId: CityId): Promise<PermissionKey[]> {
    if (user.role === 'ADMIN') {
      const isAdminOfCity = (await this.cityService.getScopedCityForAdminOrEmployee(user.id)) === cityId;
      return isAdminOfCity ? [...PERMISSION_CATALOG] : [];
    }
    if (user.role !== 'EMPLOYEE') {
      return [];
    }
    return await this.repository.listPermissionsForUserInCity(user.id, cityId);
  }

  /**
   * Variante "lecture douce" pour `/user/me` : pas d'erreur si l'employé n'a
   * aucun rôle ou si le user n'est pas EMPLOYEE — renvoie simplement `[]`.
   * Ne renvoie que id + name (cf. `RoleSummaryDto`).
   */
  async listRoleSummariesForUserInCity(user: User, cityId: CityId): Promise<RoleSummaryDto[]> {
    if (user.role !== 'EMPLOYEE') {
      return [];
    }
    const assignments = await this.repository.listAssignmentsByUserId(user.id);
    if (assignments.length === 0) {
      return [];
    }
    const summaries: RoleSummaryDto[] = [];
    for (const a of assignments) {
      const role = await this.repository.getRoleById(a.roleId);
      if (role && role.cityId === cityId) {
        summaries.push(toRoleSummaryDto(role));
      }
    }
    return summaries;
  }

  /** Maintenance --------------------------------------------------------- */

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }

  async createRoleSeeded(input: CreateRoleServiceInput & { id?: string; cityId: CityId }): Promise<RoleDto> {
    this.assertPermissionsExist(input.permissions);
    const role = await this.repository.createRole({
      id: input.id,
      cityId: input.cityId,
      name: input.name,
      description: input.description ?? '',
      permissions: dedupe(input.permissions),
    });
    return toRoleDto(role);
  }

  /** Helpers ------------------------------------------------------------- */

  private assertPermissionsExist(permissions: PermissionKey[]): void {
    for (const p of permissions) {
      if (!isValidPermissionKey(p)) {
        throw new Error(`Unknown permission: ${p}`);
      }
    }
  }

  private async assertEmployeeOfCity(cityId: CityId, userId: number): Promise<void> {
    const employee = await this.userService.getById(userId);
    if (!employee || employee.role !== 'EMPLOYEE') {
      throw new Error('Target user is not an employee');
    }
    const employeeCityId = await this.cityService.getScopedCityForAdminOrEmployee(userId);
    if (employeeCityId !== cityId) {
      throw new Error('Employee is not assigned to this city');
    }
  }
}

function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}
