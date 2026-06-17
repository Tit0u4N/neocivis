import { vi } from 'vitest';

export interface IMockAccessService {
  listPermissionCatalog: ReturnType<typeof vi.fn>;
  listRoles: ReturnType<typeof vi.fn>;
  getRole: ReturnType<typeof vi.fn>;
  createRole: ReturnType<typeof vi.fn>;
  updateRole: ReturnType<typeof vi.fn>;
  deleteRole: ReturnType<typeof vi.fn>;
  listEmployeeRoles: ReturnType<typeof vi.fn>;
  assignRole: ReturnType<typeof vi.fn>;
  unassignRole: ReturnType<typeof vi.fn>;
}

export const mockAccessService: IMockAccessService = {
  listPermissionCatalog: vi.fn(),
  listRoles: vi.fn(),
  getRole: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  listEmployeeRoles: vi.fn(),
  assignRole: vi.fn(),
  unassignRole: vi.fn(),
};
