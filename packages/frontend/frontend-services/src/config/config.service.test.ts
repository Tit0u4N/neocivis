import type { CarouselItem, Category, CitizenConfigResponse, MunicipalityConfigResponse } from '@repo/contracts/config';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from './config.service';

const CITY_ID = 'NIC_06000';

const mockCitizenConfig: CitizenConfigResponse = {
  carousel: [],
  categories: [],
};

const mockMunicipalityConfig: MunicipalityConfigResponse = {
  categories: [],
  carousel: [],
};

const mockCategory: Category = {
  id: 'cat-1',
  icon: 'home',
  color: '#FF0000',
  translations: [{ locale: 'fr', name: 'Home' }],
};

const mockCarouselItem: CarouselItem = {
  id: 'slide-1',
  order: 0,
  translations: [{ locale: 'fr', title: 'Slide 1' }],
};

function makeKy(): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
    put: vi.fn().mockReturnValue({ json }),
    extend: vi.fn(),
  };
  (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
  return base as unknown as KyInstance;
}

describe('ConfigService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: ConfigService;

  beforeEach(() => {
    ky = makeKy();
    service = new ConfigService(ky, CITY_ID);
  });

  describe('getConfig', () => {
    it('calls GET fr by default and returns the citizen config', async () => {
      const json = vi.fn().mockResolvedValue(mockCitizenConfig);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getConfig();

      expect(ky.get).toHaveBeenCalledWith('fr');
      expect(result).toEqual(mockCitizenConfig);
    });

    it('calls GET with the specified locale', async () => {
      const json = vi.fn().mockResolvedValue(mockCitizenConfig);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      await service.getConfig('en');

      expect(ky.get).toHaveBeenCalledWith('en');
    });
  });

  describe('getMunicipalityConfig', () => {
    it('calls GET all and returns the municipality config', async () => {
      const json = vi.fn().mockResolvedValue(mockMunicipalityConfig);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getMunicipalityConfig();

      expect(ky.get).toHaveBeenCalledWith('all');
      expect(result).toEqual(mockMunicipalityConfig);
    });
  });

  describe('setCategories', () => {
    it('calls PUT categories with json body and returns the updated categories', async () => {
      const json = vi.fn().mockResolvedValue([mockCategory]);
      (ky.put as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.setCategories([mockCategory]);

      expect(ky.put).toHaveBeenCalledWith('categories', { json: [mockCategory] });
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('setCarouselItems', () => {
    it('calls PUT carousel with json body and returns the updated items', async () => {
      const json = vi.fn().mockResolvedValue([mockCarouselItem]);
      (ky.put as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.setCarouselItems([mockCarouselItem]);

      expect(ky.put).toHaveBeenCalledWith('carousel', { json: [mockCarouselItem] });
      expect(result).toEqual([mockCarouselItem]);
    });
  });
});
