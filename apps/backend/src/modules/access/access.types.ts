import type { CityId, PermissionKey, RoleDto, RoleSummaryDto } from '@repo/contracts';

export type Role = Readonly<{
  id: string;
  cityId: CityId;
  name: string;
  description: string;
  permissions: PermissionKey[];
  createdAt: Date;
  updatedAt: Date;
}>;

export type EmployeeRoleAssignment = Readonly<{
  userId: number;
  roleId: string;
  createdAt: Date;
}>;

export function toRoleDto(role: Role): RoleDto {
  return {
    id: role.id,
    cityId: role.cityId,
    name: role.name,
    description: role.description,
    permissions: [...role.permissions],
  };
}

export function toRoleSummaryDto(role: Role): RoleSummaryDto {
  return { id: role.id, name: role.name };
}
