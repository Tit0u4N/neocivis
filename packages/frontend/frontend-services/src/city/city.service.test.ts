import type { CityPublicDto, OperationSuccessDto } from '@repo/contracts';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CityService } from './city.service';

const mockCity: CityPublicDto = {
  id: 'NIC_06000' as CityPublicDto['id'],
  name: 'Nice',
  description: "Ville sur la Côte d'Azur.",
};

const mockSuccess: OperationSuccessDto = { success: true };

function makeKy(): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
    post: vi.fn().mockReturnValue({ json }),
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
    it('appelle GET cities et retourne la liste', async () => {
      const json = vi.fn().mockResolvedValue([mockCity]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.listCities();

      expect(ky.get).toHaveBeenCalledWith('');
      expect(result).toEqual([mockCity]);
    });
  });

  describe('joinCity', () => {
    it('appelle POST cities/:cityId/join et retourne le succès', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.joinCity('NIC_06000');

      expect(ky.post).toHaveBeenCalledWith('NIC_06000/join');
      expect(result).toEqual(mockSuccess);
    });
  });

  describe('leaveCity', () => {
    it('appelle DELETE cities/:cityId/leave et retourne le succès', async () => {
      const json = vi.fn().mockResolvedValue(mockSuccess);
      (ky.delete as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.leaveCity('NIC_06000');

      expect(ky.delete).toHaveBeenCalledWith('NIC_06000/leave');
      expect(result).toEqual(mockSuccess);
    });
  });
});
