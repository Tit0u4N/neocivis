import type { PermissionKey } from '@repo/contracts';
import { and, eq, inArray, type SQL, sql } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import { isValidPermissionKey } from '../permission.catalog';
import type { EmployeeRoleAssignment, Role } from '../access.types';
import type {
  CreateRolePersistenceInput,
  IAccessRepository,
  UpdateRolePersistenceInput,
} from './access.repository.interface';
import { employeeRoleAssignments, rolePermissions, roles } from './access.table';

type RoleRow = typeof roles.$inferSelect;

function mapRoleRow(r: RoleRow, permissions: PermissionKey[]): Role {
  return {
    id: r.id,
    cityId: r.cityId,
    name: r.name,
    description: r.description,
    permissions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

async function loadPermissionsByRoleIds(roleIds: string[]): Promise<Map<string, PermissionKey[]>> {
  const grouped = new Map<string, PermissionKey[]>();
  if (roleIds.length === 0) {
    return grouped;
  }
  const db = getDb();
  const rows = await db.select().from(rolePermissions).where(inArray(rolePermissions.roleId, roleIds));
  for (const row of rows) {
    if (!isValidPermissionKey(row.permissionKey)) {
      continue;
    }
    const existing = grouped.get(row.roleId);
    if (existing) {
      existing.push(row.permissionKey);
    } else {
      grouped.set(row.roleId, [row.permissionKey]);
    }
  }
  return grouped;
}

export class DrizzleAccessRepository implements IAccessRepository {
  async listRolesByCity(cityId: string): Promise<Role[]> {
    const db = getDb();
    const rows = await db.select().from(roles).where(eq(roles.cityId, cityId));
    if (rows.length === 0) {
      return [];
    }
    const permsByRoleId = await loadPermissionsByRoleIds(rows.map((r) => r.id));
    return rows.map((r) => mapRoleRow(r, permsByRoleId.get(r.id) ?? []));
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    const db = getDb();
    const rows = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    const r = rows[0];
    if (!r) {
      return null;
    }
    const permsByRoleId = await loadPermissionsByRoleIds([roleId]);
    return mapRoleRow(r, permsByRoleId.get(roleId) ?? []);
  }

  async findRoleByCityAndName(cityId: string, name: string): Promise<Role | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(roles)
      .where(and(eq(roles.cityId, cityId), eq(roles.name, name)))
      .limit(1);
    const r = rows[0];
    if (!r) {
      return null;
    }
    const permsByRoleId = await loadPermissionsByRoleIds([r.id]);
    return mapRoleRow(r, permsByRoleId.get(r.id) ?? []);
  }

  async createRole(input: CreateRolePersistenceInput): Promise<Role> {
    const db = getDb();
    const inserted = await db.transaction(async (tx) => {
      const insertValues: typeof roles.$inferInsert = {
        cityId: input.cityId,
        name: input.name,
        description: input.description,
      };
      if (input.id !== undefined) {
        insertValues.id = input.id;
      }
      const rows = await tx.insert(roles).values(insertValues).returning();
      const row = rows[0];
      if (!row) {
        throw new Error('Failed to insert role');
      }
      if (input.permissions.length > 0) {
        await tx
          .insert(rolePermissions)
          .values(input.permissions.map((permissionKey) => ({ roleId: row.id, permissionKey })));
      }
      return row;
    });
    return mapRoleRow(inserted, [...input.permissions]);
  }

  async updateRole(roleId: string, input: UpdateRolePersistenceInput): Promise<Role> {
    const db = getDb();
    const updated = await db.transaction(async (tx) => {
      const patch: Partial<Omit<typeof roles.$inferInsert, 'updatedAt'>> & { updatedAt: SQL<unknown> } = {
        updatedAt: sql`now()`,
      };
      if (input.name !== undefined) {
        patch.name = input.name;
      }
      if (input.description !== undefined) {
        patch.description = input.description;
      }
      const rows = await tx.update(roles).set(patch).where(eq(roles.id, roleId)).returning();
      const row = rows[0];
      if (!row) {
        throw new Error(`Role not found: ${roleId}`);
      }
      if (input.permissions !== undefined) {
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
        if (input.permissions.length > 0) {
          await tx
            .insert(rolePermissions)
            .values(input.permissions.map((permissionKey) => ({ roleId, permissionKey })));
        }
      }
      return row;
    });
    const permsByRoleId = await loadPermissionsByRoleIds([roleId]);
    return mapRoleRow(updated, permsByRoleId.get(roleId) ?? []);
  }

  async deleteRole(roleId: string): Promise<void> {
    const db = getDb();
    await db.delete(roles).where(eq(roles.id, roleId));
  }

  async listAssignmentsByUserId(userId: number): Promise<EmployeeRoleAssignment[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(employeeRoleAssignments)
      .where(eq(employeeRoleAssignments.userId, userId));
    return rows.map((r) => ({ userId: r.userId, roleId: r.roleId, createdAt: r.createdAt }));
  }

  async listAssignmentsByRoleId(roleId: string): Promise<EmployeeRoleAssignment[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(employeeRoleAssignments)
      .where(eq(employeeRoleAssignments.roleId, roleId));
    return rows.map((r) => ({ userId: r.userId, roleId: r.roleId, createdAt: r.createdAt }));
  }

  async hasAssignment(userId: number, roleId: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select({ userId: employeeRoleAssignments.userId })
      .from(employeeRoleAssignments)
      .where(and(eq(employeeRoleAssignments.userId, userId), eq(employeeRoleAssignments.roleId, roleId)))
      .limit(1);
    return rows.length > 0;
  }

  async addAssignment(userId: number, roleId: string): Promise<void> {
    const db = getDb();
    await db.insert(employeeRoleAssignments).values({ userId, roleId }).onConflictDoNothing();
  }

  async removeAssignment(userId: number, roleId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(employeeRoleAssignments)
      .where(and(eq(employeeRoleAssignments.userId, userId), eq(employeeRoleAssignments.roleId, roleId)));
  }

  async listPermissionsForUserInCity(userId: number, cityId: string): Promise<PermissionKey[]> {
    const db = getDb();
    const rows = await db
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(employeeRoleAssignments)
      .innerJoin(roles, eq(roles.id, employeeRoleAssignments.roleId))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .where(and(eq(employeeRoleAssignments.userId, userId), eq(roles.cityId, cityId)));
    const out = new Set<PermissionKey>();
    for (const r of rows) {
      if (isValidPermissionKey(r.permissionKey)) {
        out.add(r.permissionKey);
      }
    }
    return [...out];
  }

  async deleteAll(): Promise<void> {
    const db = getDb();
    await db.delete(employeeRoleAssignments);
    await db.delete(rolePermissions);
    await db.delete(roles);
  }
}
