// biome-ignore-all lint/suspicious/useAwait: in-memory repository

import type { PermissionKey } from '@repo/contracts';
import type { EmployeeRoleAssignment, Role } from '../access.types';
import type {
  CreateRolePersistenceInput,
  IAccessRepository,
  UpdateRolePersistenceInput,
} from './access.repository.interface';

function uuid(): string {
  // crypto.randomUUID is available on Node 20+
  return crypto.randomUUID();
}

export class InMemoryAccessRepository implements IAccessRepository {
  private roles: Role[] = [];
  private assignments: EmployeeRoleAssignment[] = [];

  async listRolesByCity(cityId: string): Promise<Role[]> {
    return this.roles.filter((r) => r.cityId === cityId).map((r) => ({ ...r, permissions: [...r.permissions] }));
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    const role = this.roles.find((r) => r.id === roleId);
    return role ? { ...role, permissions: [...role.permissions] } : null;
  }

  async findRoleByCityAndName(cityId: string, name: string): Promise<Role | null> {
    const role = this.roles.find((r) => r.cityId === cityId && r.name === name);
    return role ? { ...role, permissions: [...role.permissions] } : null;
  }

  async createRole(input: CreateRolePersistenceInput): Promise<Role> {
    const now = new Date();
    const role: Role = {
      id: input.id ?? uuid(),
      cityId: input.cityId,
      name: input.name,
      description: input.description,
      permissions: [...input.permissions],
      createdAt: now,
      updatedAt: now,
    };
    this.roles.push(role);
    return { ...role, permissions: [...role.permissions] };
  }

  async updateRole(roleId: string, input: UpdateRolePersistenceInput): Promise<Role> {
    const idx = this.roles.findIndex((r) => r.id === roleId);
    if (idx === -1) {
      throw new Error(`Role not found: ${roleId}`);
    }
    const current = this.roles[idx];
    if (!current) {
      throw new Error(`Role not found: ${roleId}`);
    }
    const updated: Role = {
      id: current.id,
      cityId: current.cityId,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      permissions: input.permissions !== undefined ? [...input.permissions] : [...current.permissions],
      createdAt: current.createdAt,
      updatedAt: new Date(),
    };
    this.roles[idx] = updated;
    return { ...updated, permissions: [...updated.permissions] };
  }

  async deleteRole(roleId: string): Promise<void> {
    this.roles = this.roles.filter((r) => r.id !== roleId);
    this.assignments = this.assignments.filter((a) => a.roleId !== roleId);
  }

  async listAssignmentsByUserId(userId: number): Promise<EmployeeRoleAssignment[]> {
    return this.assignments.filter((a) => a.userId === userId).map((a) => ({ ...a }));
  }

  async listAssignmentsByRoleId(roleId: string): Promise<EmployeeRoleAssignment[]> {
    return this.assignments.filter((a) => a.roleId === roleId).map((a) => ({ ...a }));
  }

  async hasAssignment(userId: number, roleId: string): Promise<boolean> {
    return this.assignments.some((a) => a.userId === userId && a.roleId === roleId);
  }

  async addAssignment(userId: number, roleId: string): Promise<void> {
    if (this.assignments.some((a) => a.userId === userId && a.roleId === roleId)) {
      return;
    }
    this.assignments.push({ userId, roleId, createdAt: new Date() });
  }

  async removeAssignment(userId: number, roleId: string): Promise<void> {
    this.assignments = this.assignments.filter((a) => !(a.userId === userId && a.roleId === roleId));
  }

  async listPermissionsForUserInCity(userId: number, cityId: string): Promise<PermissionKey[]> {
    const userRoleIds = new Set(this.assignments.filter((a) => a.userId === userId).map((a) => a.roleId));
    const out = new Set<PermissionKey>();
    for (const role of this.roles) {
      if (role.cityId !== cityId) {
        continue;
      }
      if (!userRoleIds.has(role.id)) {
        continue;
      }
      for (const p of role.permissions) {
        out.add(p);
      }
    }
    return [...out];
  }

  async deleteAll(): Promise<void> {
    this.roles = [];
    this.assignments = [];
  }
}
