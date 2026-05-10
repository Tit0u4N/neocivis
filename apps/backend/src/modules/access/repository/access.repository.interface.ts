import type { PermissionKey } from '@repo/contracts';
import type { EmployeeRoleAssignment, Role } from '../access.types';

export type CreateRolePersistenceInput = Readonly<{
  id?: string;
  cityId: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
}>;

export type UpdateRolePersistenceInput = Readonly<{
  name?: string;
  description?: string;
  permissions?: PermissionKey[];
}>;

export interface IAccessRepository {
  /** Roles ------------------------------------------------------------- */
  listRolesByCity(cityId: string): Promise<Role[]>;
  getRoleById(roleId: string): Promise<Role | null>;
  findRoleByCityAndName(cityId: string, name: string): Promise<Role | null>;
  createRole(input: CreateRolePersistenceInput): Promise<Role>;
  updateRole(roleId: string, input: UpdateRolePersistenceInput): Promise<Role>;
  deleteRole(roleId: string): Promise<void>;

  /** Assignments ------------------------------------------------------- */
  listAssignmentsByUserId(userId: number): Promise<EmployeeRoleAssignment[]>;
  listAssignmentsByRoleId(roleId: string): Promise<EmployeeRoleAssignment[]>;
  hasAssignment(userId: number, roleId: string): Promise<boolean>;
  addAssignment(userId: number, roleId: string): Promise<void>;
  removeAssignment(userId: number, roleId: string): Promise<void>;
  /** Liste les permissions effectives d'un user dans une city donnée. */
  listPermissionsForUserInCity(userId: number, cityId: string): Promise<PermissionKey[]>;

  /** Maintenance ------------------------------------------------------- */
  deleteAll(): Promise<void>;
}
