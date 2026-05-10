import { z } from 'zod';
import { CityId } from '../city/city.schema';
import { PermissionKey } from '../permission/permission.schema';

export const RoleId = z.string().uuid();
export type RoleId = z.infer<typeof RoleId>;

export const RoleName = z.string().min(2).max(80);
export type RoleName = z.infer<typeof RoleName>;

export const RoleDescription = z.string().max(500).default('');
export type RoleDescription = z.infer<typeof RoleDescription>;

/** Rôle d'une mairie, retourné aux clients. */
export const RoleDto = z.object({
  id: RoleId,
  cityId: CityId,
  name: RoleName,
  description: z.string().max(500),
  permissions: z.array(PermissionKey),
});
export type RoleDto = z.infer<typeof RoleDto>;

/**
 * Résumé minimal d'un rôle (id + name) — utilisé par exemple dans `/user/me`
 * pour lister les rôles attribués à un employé sans révéler la liste de
 * permissions ni la description (ces détails sont admin-only).
 */
export const RoleSummaryDto = z.object({
  id: RoleId,
  name: RoleName,
});
export type RoleSummaryDto = z.infer<typeof RoleSummaryDto>;

export const CreateRoleInput = z.object({
  name: RoleName,
  description: RoleDescription,
  permissions: z.array(PermissionKey).default([]),
});
export type CreateRoleInput = z.infer<typeof CreateRoleInput>;

export const UpdateRoleInput = z.object({
  name: RoleName.optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(PermissionKey).optional(),
});
export type UpdateRoleInput = z.infer<typeof UpdateRoleInput>;

/** Affectation d'un rôle à un employé d'une mairie (lecture). */
export const EmployeeRolesDto = z.object({
  userId: z.number().int().positive(),
  cityId: CityId,
  roles: z.array(RoleDto),
});
export type EmployeeRolesDto = z.infer<typeof EmployeeRolesDto>;
