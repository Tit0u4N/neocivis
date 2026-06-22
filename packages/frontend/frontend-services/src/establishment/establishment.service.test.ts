import type { CreateEstablishmentInput, Establishment, UpdateEstablishmentInput } from '@repo/contracts/establishment';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstablishmentService } from './establishment.service';

const CITY_ID = 'NIC_06000';

const mockEstablishment: Establishment = {
  id: 'est-1',
  name: 'Nice Town Hall',
  type: 'town_hall',
  address: '5 Rue de l\'Hôtel de Ville, 06000 Nice',
  hours: 'Mon-Fri 08:00-17:00',
  phone: '+33 4 97 13 20 00',
};

function makeKy(): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
    post: vi.fn().mockReturnValue({ json }),
    put: vi.fn().mockReturnValue({ json }),
    delete: vi.fn().mockReturnValue({ json }),
    extend: vi.fn(),
  };
  (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
  return base as unknown as KyInstance;
}

describe('EstablishmentService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: EstablishmentService;

  beforeEach(() => {
    ky = makeKy();
    service = new EstablishmentService(ky, CITY_ID);
  });

  describe('getAll', () => {
    it('calls GET establishment/all and returns the list', async () => {
      const json = vi.fn().mockResolvedValue([mockEstablishment]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getAll();

      expect(ky.get).toHaveBeenCalledWith('establishment/all');
      expect(result).toEqual([mockEstablishment]);
    });
  });

  describe('getById', () => {
    it('calls GET establishment/:id and returns the establishment', async () => {
      const json = vi.fn().mockResolvedValue(mockEstablishment);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getById('est-1');

      expect(ky.get).toHaveBeenCalledWith('establishment/est-1');
      expect(result).toEqual(mockEstablishment);
    });
  });

  describe('create', () => {
    it('calls POST establishment with json body and returns the created establishment', async () => {
      const json = vi.fn().mockResolvedValue(mockEstablishment);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input: CreateEstablishmentInput = {
        name: 'Nice Town Hall',
        type: 'town_hall',
        address: '5 Rue de l\'Hôtel de Ville, 06000 Nice',
        hours: 'Mon-Fri 08:00-17:00',
        phone: '+33 4 97 13 20 00',
      };
      const result = await service.create(input);

      expect(ky.post).toHaveBeenCalledWith('establishment', { json: input });
      expect(result).toEqual(mockEstablishment);
    });
  });

  describe('update', () => {
    it('calls PUT establishment/:id with json body and returns the updated establishment', async () => {
      const updated = { ...mockEstablishment, name: 'Updated Town Hall' };
      const json = vi.fn().mockResolvedValue(updated);
      (ky.put as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input: UpdateEstablishmentInput = { name: 'Updated Town Hall' };
      const result = await service.update('est-1', input);

      expect(ky.put).toHaveBeenCalledWith('establishment/est-1', { json: input });
      expect(result.name).toBe('Updated Town Hall');
    });
  });

  describe('delete', () => {
    it('calls DELETE establishment/:id', async () => {
      await service.delete('est-1');

      expect(ky.delete).toHaveBeenCalledWith('establishment/est-1');
    });
  });
});
