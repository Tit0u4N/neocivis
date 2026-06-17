import type { CityPublicDto, OperationSuccessDto, UserPublicDto } from '@repo/contracts';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CityService } from './city.service';

const mockCity: CityPublicDto = {
  id: 'NIC_06000' as CityPublicDto['id'],
  name: 'Nice',
  description: "City on the French Riviera.",
};

const mockUser: UserPublicDto = { id: 1, username: 'jean.dupont', firstName: 'Jean', lastName: 'DUPONT' };

const mockSuccess: OperationSuccessDto = { success: true };

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

describe('CityService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: CityService;

  beforeEach(() => {
    ky = makeKy();
    service = new CityService(ky);
  });

  describe('listCities', () => {
    it('calls GET cities and returns the list', async () => {
      const json = vi.fn().mockResolvedValue([mockCity]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listCities();

      expect(ky.get).toHaveBeenCalledWith('cities');
      expect(result).toEqual([mockCity]);
    });
  });

  describe('joinCity', () => {
    it('calls POST cities/:cityId/join and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.joinCity('NIC_06000');

      expect(ky.post).toHaveBeenCalledWith('cities/NIC_06000/join');
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('leaveCity', () => {
    it('calls DELETE cities/:cityId/leave and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.delete as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.leaveCity('NIC_06000');

      expect(ky.delete).toHaveBeenCalledWith('cities/NIC_06000/leave');
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('updateCity', () => {
    it('calls PATCH cities/:cityId with body and returns the updated city', async () => {
      const json = vi.fn().mockResolvedValue(mockCity);
      (ky.patch as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { description: 'Updated description.' };
      const result = await service.updateCity('NIC_06000', input);

      expect(ky.patch).toHaveBeenCalledWith('cities/NIC_06000', { json: input });
      expect(result).toEqual(mockCity);
    });
  });

  describe('listCitizens', () => {
    it('calls GET cities/:cityId/citizens and returns the list', async () => {
      const json = vi.fn().mockResolvedValue([mockUser]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listCitizens('NIC_06000');

      expect(ky.get).toHaveBeenCalledWith('cities/NIC_06000/citizens');
      expect(result).toEqual([mockUser]);
    });
  });

  describe('listEmployees', () => {
    it('calls GET cities/:cityId/employees and returns the list', async () => {
      const json = vi.fn().mockResolvedValue([mockUser]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listEmployees('NIC_06000');

      expect(ky.get).toHaveBeenCalledWith('cities/NIC_06000/employees');
      expect(result).toEqual([mockUser]);
    });
  });

  describe('createAndAssignEmployee', () => {
    it('calls POST cities/:cityId/employees with body and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { username: 'jean.dupont', email: 'jean@nice.fr', firstName: 'Jean', lastName: 'DUPONT' };
      const result = await service.createAndAssignEmployee('NIC_06000', input);

      expect(ky.post).toHaveBeenCalledWith('cities/NIC_06000/employees', { json: input });
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('unassignEmployee', () => {
    it('calls DELETE cities/:cityId/employees/:userId and returns success', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.delete as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.unassignEmployee('NIC_06000', 42);

      expect(ky.delete).toHaveBeenCalledWith('cities/NIC_06000/employees/42');
      expect(result).toEqual(mockSuccess);
    });
  });
});
