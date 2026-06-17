import type { EmployeeRolesDto, OperationSuccessDto, PermissionDto, RoleDto } from '@repo/contracts';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessService } from './access.service';

const CITY_ID = 'NIC_06000';
const ROLE_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = 42;

const mockRole: RoleDto = {
  id: ROLE_ID,
  cityId: CITY_ID as RoleDto['cityId'],
  name: 'Modérateur Forum',
  description: 'Peut modérer le forum',
  permissions: ['FORUM_THREAD_DELETE_PERMISSION', 'FORUM_THREAD_BAN_USER_PERMISSION'],
};

const mockPermission: PermissionDto = { key: 'ARTICLE_PUBLISH_PERMISSION' };

const mockSuccess: OperationSuccessDto = { success: true };

const mockEmployeeRoles: EmployeeRolesDto = {
  userId: USER_ID,
  cityId: CITY_ID as EmployeeRolesDto['cityId'],
  roles: [mockRole],
};

function makeKy(): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
    post: vi.fn().mockReturnValue({ json }),
    put: vi.fn().mockReturnValue({ json }),
    patch: vi.fn().mockReturnValue({ json }),
    delete: vi.fn().mockReturnValue({ json }),
    extend: vi.fn(),
  };
  (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
  return base as unknown as KyInstance;
}

describe('AccessService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: AccessService;

  beforeEach(() => {
    ky = makeKy();
    service = new AccessService(ky, CITY_ID);
  });

  describe('listPermissionCatalog', () => {
    it('calls GET permissions on the unscoped ky instance and returns catalog', async () => {
      const json = vi.fn().mockResolvedValue([mockPermission]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listPermissionCatalog();

      expect(ky.get).toHaveBeenCalledWith('permissions');
      expect(result).toEqual([mockPermission]);
    });
  });

  describe('listRoles', () => {
    it('calls GET roles and returns the role list', async () => {
      const json = vi.fn().mockResolvedValue([mockRole]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listRoles();

      expect(ky.get).toHaveBeenCalledWith('roles');
      expect(result).toEqual([mockRole]);
    });
  });

  describe('getRole', () => {
    it('calls GET roles/:roleId and returns the role', async () => {
      const json = vi.fn().mockResolvedValue(mockRole);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getRole(ROLE_ID);

      expect(ky.get).toHaveBeenCalledWith(`roles/${ROLE_ID}`);
      expect(result).toEqual(mockRole);
    });
  });

  describe('createRole', () => {
    it('calls POST roles with json body and returns the created role', async () => {
      const json = vi.fn().mockResolvedValue(mockRole);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { name: 'Modérateur Forum', description: 'Test', permissions: [] as RoleDto['permissions'] };
      const result = await service.createRole(input);

      expect(ky.post).toHaveBeenCalledWith('roles', { json: input });
      expect(result).toEqual(mockRole);
    });
  });

  describe('updateRole', () => {
    it('calls PUT roles/:roleId with json body and returns the updated role', async () => {
      const json = vi.fn().mockResolvedValue(mockRole);
      (ky.put as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { description: 'Mise à jour' };
      const result = await service.updateRole(ROLE_ID, input);

      expect(ky.put).toHaveBeenCalledWith(`roles/${ROLE_ID}`, { json: input });
      expect(result).toEqual(mockRole);
    });
  });

  describe('deleteRole', () => {
    it('calls DELETE roles/:roleId and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.delete as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.deleteRole(ROLE_ID);

      expect(ky.delete).toHaveBeenCalledWith(`roles/${ROLE_ID}`);
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('listEmployeeRoles', () => {
    it('calls GET employees/:userId/roles and returns EmployeeRolesDto', async () => {
      const json = vi.fn().mockResolvedValue(mockEmployeeRoles);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listEmployeeRoles(USER_ID);

      expect(ky.get).toHaveBeenCalledWith(`employees/${USER_ID}/roles`);
      expect(result).toEqual(mockEmployeeRoles);
    });
  });

  describe('assignRole', () => {
    it('calls POST employees/:userId/roles/:roleId and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.assignRole(USER_ID, ROLE_ID);

      expect(ky.post).toHaveBeenCalledWith(`employees/${USER_ID}/roles/${ROLE_ID}`);
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('unassignRole', () => {
    it('calls DELETE employees/:userId/roles/:roleId and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.delete as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.unassignRole(USER_ID, ROLE_ID);

      expect(ky.delete).toHaveBeenCalledWith(`employees/${USER_ID}/roles/${ROLE_ID}`);
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('constructor', () => {
    it('is city-scoped for role methods', () => {
      const json = vi.fn();
      const base = {
        get: vi.fn().mockReturnValue({ json }),
        post: vi.fn().mockReturnValue({ json }),
        put: vi.fn().mockReturnValue({ json }),
        patch: vi.fn().mockReturnValue({ json }),
        delete: vi.fn().mockReturnValue({ json }),
        extend: vi.fn(),
      };
      (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
      const kyInstance = base as unknown as KyInstance;

      new AccessService(kyInstance, CITY_ID);

      const factory = (base.extend as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const opts = factory({ prefixUrl: 'http://api' });
      expect(opts.prefixUrl).toBe(`http://api/cities/${CITY_ID}`);
    });
  });
});
