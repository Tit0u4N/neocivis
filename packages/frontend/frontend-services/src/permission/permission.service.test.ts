import { describe, expect, it } from 'vitest';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  describe('fetchPermissions', () => {
    it('returns an empty permissions array and the admin role', async () => {
      const service = new PermissionService();

      const result = await service.fetchPermissions();

      expect(result).toEqual({ permissions: [], role: 'admin' });
    });
  });
});
