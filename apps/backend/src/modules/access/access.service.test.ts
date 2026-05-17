/** biome-ignore-all lint/suspicious/useAwait: test mocks */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';
import type { User } from '@/modules/users/user.types';
import { AccessService } from './access.service';
import { PERMISSION_CATALOG } from './permission.catalog';
import { InMemoryAccessRepository } from './repository/access.inmemory.repository';

const NICE: string = 'NIC_00001';
const BIOT: string = 'BIO_00002';

function makeUser(overrides: Partial<User> & Pick<User, 'id' | 'role' | 'keycloakId'>): User {
  const now = new Date();
  return {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

type EmployeeFixture = {
  user: User;
  cityId: string | null;
};

function makeCityServiceMock(employees: Map<number, EmployeeFixture>, admins: Map<number, string>) {
  return {
    getScopedCityForAdminOrEmployee: vi.fn(async (userId: number) => {
      const adminCity = admins.get(userId);
      if (adminCity) {
        return adminCity;
      }
      return employees.get(userId)?.cityId ?? null;
    }),
    isStaffOfCity: vi.fn(async (cityId: string, userId: number) => {
      if (admins.get(userId) === cityId) {
        return true;
      }
      return employees.get(userId)?.cityId === cityId;
    }),
  } as unknown as CityService;
}

function makeUserServiceMock(usersById: Map<number, User>) {
  return {
    getById: vi.fn(async (id: number) => usersById.get(id)),
  } as unknown as UserService;
}

describe('AccessService', () => {
  let repository: InMemoryAccessRepository;
  let employees: Map<number, EmployeeFixture>;
  let admins: Map<number, string>;
  let usersById: Map<number, User>;
  let service: AccessService;

  beforeEach(() => {
    repository = new InMemoryAccessRepository();
    const employee = makeUser({ id: 50, role: 'EMPLOYEE', keycloakId: 'kc-emp-50', username: 'emp-nice' });
    const otherEmployee = makeUser({ id: 51, role: 'EMPLOYEE', keycloakId: 'kc-emp-51', username: 'emp-biot' });
    const adminUser = makeUser({ id: 10, role: 'ADMIN', keycloakId: 'kc-admin-10', username: 'admin-nice' });
    const citizen = makeUser({ id: 80, role: 'CITIZEN', keycloakId: 'kc-cit-80', username: 'citizen' });

    employees = new Map([
      [50, { user: employee, cityId: NICE }],
      [51, { user: otherEmployee, cityId: BIOT }],
    ]);
    admins = new Map([[10, NICE]]);
    usersById = new Map([
      [10, adminUser],
      [50, employee],
      [51, otherEmployee],
      [80, citizen],
    ]);

    const cityService = makeCityServiceMock(employees, admins);
    const userService = makeUserServiceMock(usersById);
    service = new AccessService(repository, cityService, userService);
  });

  describe('catalog', () => {
    it('exposes the full permission catalog', async () => {
      const catalog = await service.listPermissionCatalog();
      expect(catalog).toHaveLength(PERMISSION_CATALOG.length);
      expect(catalog.map((p) => p.key)).toEqual([...PERMISSION_CATALOG]);
    });
  });

  describe('roles CRUD', () => {
    it('creates a role with valid permissions', async () => {
      const role = await service.createRole(NICE, {
        name: 'Modérateur Forum',
        description: 'Modère le forum',
        permissions: ['FORUM_THREAD_DELETE_PERMISSION', 'FORUM_THREAD_BAN_USER_PERMISSION'],
      });
      expect(role.id).toBeDefined();
      expect(role.cityId).toBe(NICE);
      expect(role.permissions).toEqual(['FORUM_THREAD_DELETE_PERMISSION', 'FORUM_THREAD_BAN_USER_PERMISSION']);
    });

    it('rejects creating a role with an unknown permission', async () => {
      await expect(
        service.createRole(NICE, {
          name: 'X',
          description: '',
          permissions: ['NOPE_PERMISSION' as never],
        }),
      ).rejects.toThrow(/Unknown permission/);
    });

    it('rejects duplicate role name within the same city', async () => {
      await service.createRole(NICE, { name: 'Modo', description: '', permissions: [] });
      await expect(service.createRole(NICE, { name: 'Modo', description: '', permissions: [] })).rejects.toThrow(
        /already exists/,
      );
    });

    it('allows the same role name in another city (per-city uniqueness)', async () => {
      await service.createRole(NICE, { name: 'Modo', description: '', permissions: [] });
      const inBiot = await service.createRole(BIOT, { name: 'Modo', description: '', permissions: [] });
      expect(inBiot.cityId).toBe(BIOT);
    });

    it('updates name, description and permissions of an existing role', async () => {
      const created = await service.createRole(NICE, {
        name: 'Modo',
        description: 'desc',
        permissions: ['FORUM_THREAD_DELETE_PERMISSION'],
      });
      const updated = await service.updateRole(NICE, created.id, {
        name: 'Modo Sénior',
        description: 'plus de droits',
        permissions: ['FORUM_THREAD_DELETE_PERMISSION', 'FORUM_THREAD_BAN_USER_PERMISSION'],
      });
      expect(updated.name).toBe('Modo Sénior');
      expect(updated.description).toBe('plus de droits');
      expect(updated.permissions).toEqual(['FORUM_THREAD_DELETE_PERMISSION', 'FORUM_THREAD_BAN_USER_PERMISSION']);
    });

    it('lists roles for a given city only', async () => {
      await service.createRole(NICE, { name: 'A', description: '', permissions: [] });
      await service.createRole(NICE, { name: 'B', description: '', permissions: [] });
      await service.createRole(BIOT, { name: 'C', description: '', permissions: [] });
      const niceRoles = await service.listRolesForCity(NICE);
      expect(niceRoles.map((r) => r.name).sort()).toEqual(['A', 'B']);
    });

    it('cascades on delete: assigned employees lose the role', async () => {
      const role = await service.createRole(NICE, {
        name: 'Modo',
        description: '',
        permissions: ['FORUM_THREAD_DELETE_PERMISSION'],
      });
      await service.assignRole(NICE, 50, role.id);
      await expect(service.listEmployeeRoles(NICE, 50)).resolves.toMatchObject({ roles: [{ id: role.id }] });

      await service.deleteRole(NICE, role.id);

      await expect(service.listEmployeeRoles(NICE, 50)).resolves.toMatchObject({ roles: [] });
      await expect(service.listRolesForCity(NICE)).resolves.toEqual([]);
    });

    it('rejects updateRole / deleteRole when the role does not belong to the city', async () => {
      const role = await service.createRole(BIOT, { name: 'X', description: '', permissions: [] });
      await expect(service.updateRole(NICE, role.id, { name: 'Y' })).rejects.toThrow(/Role not found/);
      await expect(service.deleteRole(NICE, role.id)).rejects.toThrow(/Role not found/);
    });
  });

  describe('assignments', () => {
    it('assigns and unassigns a role to an employee of the city', async () => {
      const role = await service.createRole(NICE, {
        name: 'Modo',
        description: '',
        permissions: ['FORUM_THREAD_DELETE_PERMISSION'],
      });
      await service.assignRole(NICE, 50, role.id);
      const assigned = await service.listEmployeeRoles(NICE, 50);
      expect(assigned.roles.map((r) => r.id)).toEqual([role.id]);

      await service.unassignRole(NICE, 50, role.id);
      const after = await service.listEmployeeRoles(NICE, 50);
      expect(after.roles).toEqual([]);
    });

    it('supports multiple roles per employee', async () => {
      const r1 = await service.createRole(NICE, { name: 'A', description: '', permissions: [] });
      const r2 = await service.createRole(NICE, { name: 'B', description: '', permissions: [] });
      await service.assignRole(NICE, 50, r1.id);
      await service.assignRole(NICE, 50, r2.id);
      const dto = await service.listEmployeeRoles(NICE, 50);
      expect(dto.roles.map((r) => r.id).sort()).toEqual([r1.id, r2.id].sort());
    });

    it('refuses to assign a role to an employee of another city', async () => {
      const role = await service.createRole(NICE, { name: 'Modo', description: '', permissions: [] });
      await expect(service.assignRole(NICE, 51, role.id)).rejects.toThrow(/not assigned to this city/);
    });

    it('refuses to assign a role belonging to another city', async () => {
      const otherCityRole = await service.createRole(BIOT, { name: 'X', description: '', permissions: [] });
      await expect(service.assignRole(NICE, 50, otherCityRole.id)).rejects.toThrow(/Role not found in this city/);
    });

    it('refuses to assign a role to a non-employee', async () => {
      const role = await service.createRole(NICE, { name: 'Modo', description: '', permissions: [] });
      await expect(service.assignRole(NICE, 80, role.id)).rejects.toThrow(/not an employee/);
    });
  });

  describe('userHasPermission', () => {
    it('returns true for ADMIN of the city (bypass)', async () => {
      const admin = usersById.get(10) as User;
      await expect(service.userHasPermission(admin, NICE, 'NOTIFICATION_SEND_PERMISSION')).resolves.toBe(true);
    });

    it('returns false for ADMIN of another city', async () => {
      const admin = usersById.get(10) as User;
      await expect(service.userHasPermission(admin, BIOT, 'NOTIFICATION_SEND_PERMISSION')).resolves.toBe(false);
    });

    it('returns true for an EMPLOYEE whose role grants the permission in this city', async () => {
      const role = await service.createRole(NICE, {
        name: 'Pub',
        description: '',
        permissions: ['ARTICLE_PUBLISH_PERMISSION'],
      });
      await service.assignRole(NICE, 50, role.id);
      const emp = usersById.get(50) as User;
      await expect(service.userHasPermission(emp, NICE, 'ARTICLE_PUBLISH_PERMISSION')).resolves.toBe(true);
      await expect(service.userHasPermission(emp, NICE, 'ARTICLE_DELETE_PERMISSION')).resolves.toBe(false);
    });

    it('returns false for an EMPLOYEE without any role', async () => {
      const emp = usersById.get(50) as User;
      await expect(service.userHasPermission(emp, NICE, 'ARTICLE_PUBLISH_PERMISSION')).resolves.toBe(false);
    });

    it('returns false for an EMPLOYEE not staff of the city', async () => {
      const role = await service.createRole(NICE, {
        name: 'Pub',
        description: '',
        permissions: ['ARTICLE_PUBLISH_PERMISSION'],
      });
      await service.assignRole(NICE, 50, role.id);
      const otherEmp = usersById.get(51) as User;
      await expect(service.userHasPermission(otherEmp, NICE, 'ARTICLE_PUBLISH_PERMISSION')).resolves.toBe(false);
    });

    it('returns false for a CITIZEN', async () => {
      const role = await service.createRole(NICE, {
        name: 'Pub',
        description: '',
        permissions: ['ARTICLE_PUBLISH_PERMISSION'],
      });
      await service.assignRole(NICE, 50, role.id);
      const citizen = usersById.get(80) as User;
      await expect(service.userHasPermission(citizen, NICE, 'ARTICLE_PUBLISH_PERMISSION')).resolves.toBe(false);
    });
  });

  describe('listEffectivePermissions', () => {
    it('returns the full catalog for the ADMIN of the city', async () => {
      const admin = usersById.get(10) as User;
      const perms = await service.listEffectivePermissions(admin, NICE);
      expect(perms).toHaveLength(PERMISSION_CATALOG.length);
    });

    it('aggregates and deduplicates permissions from all roles of an employee', async () => {
      const r1 = await service.createRole(NICE, {
        name: 'A',
        description: '',
        permissions: ['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_MODIFY_PERMISSION'],
      });
      const r2 = await service.createRole(NICE, {
        name: 'B',
        description: '',
        permissions: ['ARTICLE_MODIFY_PERMISSION', 'ARTICLE_DELETE_PERMISSION'],
      });
      await service.assignRole(NICE, 50, r1.id);
      await service.assignRole(NICE, 50, r2.id);
      const emp = usersById.get(50) as User;
      const perms = await service.listEffectivePermissions(emp, NICE);
      expect(new Set(perms)).toEqual(
        new Set(['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_MODIFY_PERMISSION', 'ARTICLE_DELETE_PERMISSION']),
      );
    });
  });
});
