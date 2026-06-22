import { describe, expect, it, vi } from 'vitest';
import type { MediaLinkService } from '@/modules/media/service/media-link.service';
import { InMemoryEstablishmentRepository } from '../repository/establishment.inmemory.repository';
import { EstablishmentService } from './establishment.service';

const CITY_ID = 'city-test';
const OTHER_CITY = 'city-other';

const BASE_DATA = {
  name: 'Mairie Centrale',
  type: 'town_hall' as const,
  address: '1 Place du Général de Gaulle',
  hours: 'Lun-Ven 8h-17h',
  phone: '+33 4 92 17 20 00',
};

describe('EstablishmentService', () => {
  const makeService = (mediaLinkService?: Partial<MediaLinkService>) => {
    const repo = new InMemoryEstablishmentRepository();
    const service = new EstablishmentService(repo, mediaLinkService as MediaLinkService | undefined);
    return { repo, service };
  };

  describe('list', () => {
    it('returns establishments for the requested city only', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      await repo.create({ id: 'e2', cityId: OTHER_CITY, ...BASE_DATA });
      const list = await service.list(CITY_ID);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('e1');
    });

    it('strips cityId from returned DTOs', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      const list = await service.list(CITY_ID);
      expect('cityId' in list[0]).toBe(false);
    });

    it('returns an empty list when no establishments exist for the city', async () => {
      const { service } = makeService();
      expect(await service.list(CITY_ID)).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('returns the establishment DTO when found', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      const result = await service.getById(CITY_ID, 'e1');
      expect(result?.id).toBe('e1');
      expect(result?.name).toBe(BASE_DATA.name);
    });

    it('strips cityId from the returned DTO', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      const result = await service.getById(CITY_ID, 'e1');
      expect('cityId' in (result ?? {})).toBe(false);
    });

    it('returns undefined when the id does not exist', async () => {
      const { service } = makeService();
      expect(await service.getById(CITY_ID, 'missing')).toBeUndefined();
    });

    it('returns undefined when the establishment belongs to another city', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: OTHER_CITY, ...BASE_DATA });
      expect(await service.getById(CITY_ID, 'e1')).toBeUndefined();
    });
  });

  describe('create', () => {
    it('creates an establishment and returns a DTO without cityId', async () => {
      const { service } = makeService();
      const result = await service.create(CITY_ID, BASE_DATA);
      expect(result.id).toBeDefined();
      expect(result.name).toBe(BASE_DATA.name);
      expect(result.type).toBe(BASE_DATA.type);
      expect('cityId' in result).toBe(false);
    });

    it('generates a unique UUID per establishment', async () => {
      const { service } = makeService();
      const a = await service.create(CITY_ID, BASE_DATA);
      const b = await service.create(CITY_ID, BASE_DATA);
      expect(a.id).not.toBe(b.id);
    });

    it('calls mediaLinkService.syncEstablishmentMediaLinks when provided', async () => {
      const syncEstablishmentMediaLinks = vi.fn(async () => {});
      const { service } = makeService({ syncEstablishmentMediaLinks });
      await service.create(CITY_ID, { ...BASE_DATA, imageUrl: 'https://example.com/img.jpg' });
      expect(syncEstablishmentMediaLinks).toHaveBeenCalledOnce();
    });

    it('does not throw when no mediaLinkService is provided', async () => {
      const { service } = makeService();
      await expect(service.create(CITY_ID, BASE_DATA)).resolves.toBeDefined();
    });
  });

  describe('update', () => {
    it('returns undefined when the establishment is not found', async () => {
      const { service } = makeService();
      expect(await service.update(CITY_ID, 'missing', { name: 'New Name' })).toBeUndefined();
    });

    it('returns undefined when the establishment belongs to another city', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: OTHER_CITY, ...BASE_DATA });
      expect(await service.update(CITY_ID, 'e1', { name: 'New Name' })).toBeUndefined();
    });

    it('updates the establishment and returns the DTO without cityId', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      const updated = await service.update(CITY_ID, 'e1', { name: 'Mairie Nord' });
      expect(updated?.name).toBe('Mairie Nord');
      expect('cityId' in (updated ?? {})).toBe(false);
    });

    it('preserves unchanged fields after a partial update', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      const updated = await service.update(CITY_ID, 'e1', { name: 'Nouveau nom' });
      expect(updated?.type).toBe(BASE_DATA.type);
      expect(updated?.phone).toBe(BASE_DATA.phone);
    });

    it('calls mediaLinkService.syncEstablishmentMediaLinks after a successful update', async () => {
      const syncEstablishmentMediaLinks = vi.fn(async () => {});
      const { service, repo } = makeService({ syncEstablishmentMediaLinks });
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      await service.update(CITY_ID, 'e1', { name: 'Updated' });
      expect(syncEstablishmentMediaLinks).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('returns false when the establishment is not found', async () => {
      const { service } = makeService();
      expect(await service.delete(CITY_ID, 'missing')).toBe(false);
    });

    it('returns false when the establishment belongs to another city', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: OTHER_CITY, ...BASE_DATA });
      expect(await service.delete(CITY_ID, 'e1')).toBe(false);
    });

    it('deletes the establishment and returns true', async () => {
      const { service, repo } = makeService();
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      expect(await service.delete(CITY_ID, 'e1')).toBe(true);
      expect(await service.getById(CITY_ID, 'e1')).toBeUndefined();
    });

    it('calls mediaLinkService.removeEstablishmentMediaLinks before deleting', async () => {
      const removeEstablishmentMediaLinks = vi.fn(async () => {});
      const { service, repo } = makeService({ removeEstablishmentMediaLinks });
      await repo.create({ id: 'e1', cityId: CITY_ID, ...BASE_DATA });
      await service.delete(CITY_ID, 'e1');
      expect(removeEstablishmentMediaLinks).toHaveBeenCalledWith(CITY_ID, 'e1');
    });
  });
});
