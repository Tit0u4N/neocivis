import type { UserMeDto } from '@repo/contracts';
import type { KyInstance } from 'ky';
import { describe, expect, it, vi } from 'vitest';
import { AuthService, type UpdateUserData } from './auth.service';

const mockUser: UserMeDto = {
  id: 1,
  username: 'jdoe',
  email: 'jdoe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CITIZEN',
  memberships: [],
  permissions: [],
  roles: [],
};

function makeApi(): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
  };
  return base as unknown as KyInstance;
}

describe('AuthService', () => {
  describe('getMe', () => {
    it('calls GET user/me and returns the current user', async () => {
      const api = makeApi();
      const json = vi.fn().mockResolvedValue(mockUser);
      (api.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const service = new AuthService(api);
      const result = await service.getMe();

      expect(api.get).toHaveBeenCalledWith('user/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('throws Not implemented', async () => {
      const service = new AuthService(makeApi());
      const data: UpdateUserData = { firstName: 'Jane' };

      await expect(service.updateUser(data)).rejects.toThrow('Not implemented');
    });
  });

  describe('deleteAccount', () => {
    it('throws Not implemented', async () => {
      const service = new AuthService(makeApi());

      await expect(service.deleteAccount()).rejects.toThrow('Not implemented');
    });
  });
});
