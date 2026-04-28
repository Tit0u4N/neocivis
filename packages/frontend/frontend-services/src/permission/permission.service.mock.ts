import { vi } from 'vitest';

export interface IMockPermissionService {
  fetchPermissions: ReturnType<typeof vi.fn>;
}

export const mockPermissionService: IMockPermissionService = {
  fetchPermissions: vi.fn(),
};
