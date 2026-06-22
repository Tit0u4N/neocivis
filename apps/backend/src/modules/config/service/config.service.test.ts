import { describe, expect, it } from 'vitest';
import type { CarouselItem, Category } from '@repo/contracts/config';
import { InMemoryMediaRepository } from '@/modules/media/repository/media.inmemory.repository';
import { InMemoryConfigRepository } from '../repository/config.inmemory.repository';
import { ConfigService } from './config.service';

const CITY_ID = 'city-test';

function makeCarouselItem(id: string, overrides: Partial<CarouselItem> = {}): CarouselItem {
  return {
    id,
    order: 0,
    translations: [{ locale: 'fr', title: 'Titre' }],
    ...overrides,
  };
}

function makeCategory(id: string, overrides: Partial<Category> = {}): Category {
  return {
    id,
    icon: 'Star',
    color: '#FF0000',
    translations: [{ locale: 'fr', name: 'Catégorie' }],
    ...overrides,
  };
}

describe('ConfigService', () => {
  const makeService = () => {
    const repo = new InMemoryConfigRepository();
    const service = new ConfigService(repo);
    return { repo, service };
  };

  describe('getConfig', () => {
    it('returns empty carousel and seeded categories for a new city', async () => {
      const { service } = makeService();
      const config = await service.getConfig(CITY_ID, 'fr');
      expect(config.carousel).toHaveLength(0);
      expect(config.categories.length).toBeGreaterThan(0);
    });

    it('resolves carousel items in the requested locale', async () => {
      const { repo, service } = makeService();
      await repo.setCarouselItems(CITY_ID, [
        makeCarouselItem('c1', {
          translations: [
            { locale: 'fr', title: 'Titre FR', description: 'Desc FR' },
            { locale: 'en', title: 'Title EN', description: 'Desc EN' },
          ],
        }),
      ]);
      const frConfig = await service.getConfig(CITY_ID, 'fr');
      expect(frConfig.carousel[0].title).toBe('Titre FR');
      expect(frConfig.carousel[0].description).toBe('Desc FR');
      const enConfig = await service.getConfig(CITY_ID, 'en');
      expect(enConfig.carousel[0].title).toBe('Title EN');
    });

    it('sorts carousel items by order ascending', async () => {
      const { repo, service } = makeService();
      await repo.setCarouselItems(CITY_ID, [
        makeCarouselItem('c3', { order: 2, translations: [{ locale: 'fr', title: 'Three' }] }),
        makeCarouselItem('c1', { order: 0, translations: [{ locale: 'fr', title: 'One' }] }),
        makeCarouselItem('c2', { order: 1, translations: [{ locale: 'fr', title: 'Two' }] }),
      ]);
      const { carousel } = await service.getConfig(CITY_ID, 'fr');
      expect(carousel.map((i) => i.title)).toEqual(['One', 'Two', 'Three']);
    });

    it('falls back to fr when the requested locale is absent', async () => {
      const { repo, service } = makeService();
      await repo.setCarouselItems(CITY_ID, [
        makeCarouselItem('c1', { translations: [{ locale: 'fr', title: 'Titre FR' }] }),
      ]);
      const { carousel } = await service.getConfig(CITY_ID, 'de');
      expect(carousel[0].title).toBe('Titre FR');
    });

    it('falls back to the first translation when fr is also absent', async () => {
      const { repo, service } = makeService();
      await repo.setCarouselItems(CITY_ID, [
        makeCarouselItem('c1', { translations: [{ locale: 'en', title: 'Title EN' }] }),
      ]);
      const { carousel } = await service.getConfig(CITY_ID, 'de');
      expect(carousel[0].title).toBe('Title EN');
    });

    it('resolves category name in the requested locale', async () => {
      const { repo, service } = makeService();
      await repo.setCategories(CITY_ID, [
        makeCategory('cat-1', {
          translations: [
            { locale: 'fr', name: 'Sport' },
            { locale: 'en', name: 'Sports' },
          ],
        }),
      ]);
      expect((await service.getConfig(CITY_ID, 'fr')).categories[0].name).toBe('Sport');
      expect((await service.getConfig(CITY_ID, 'en')).categories[0].name).toBe('Sports');
    });

    it('does not expose the raw translations array in resolved carousel items', async () => {
      const { repo, service } = makeService();
      await repo.setCarouselItems(CITY_ID, [
        makeCarouselItem('c1', { translations: [{ locale: 'fr', title: 'T' }] }),
      ]);
      const { carousel } = await service.getConfig(CITY_ID, 'fr');
      expect('translations' in carousel[0]).toBe(false);
    });

    it('does not expose the raw translations array in resolved categories', async () => {
      const { repo, service } = makeService();
      await repo.setCategories(CITY_ID, [makeCategory('cat-1')]);
      const { categories } = await service.getConfig(CITY_ID, 'fr');
      expect('translations' in categories[0]).toBe(false);
    });
  });

  describe('getMunicipalityConfig', () => {
    it('returns raw carousel without locale resolution', async () => {
      const { repo, service } = makeService();
      const items = [makeCarouselItem('c1')];
      await repo.setCarouselItems(CITY_ID, items);
      const config = await service.getMunicipalityConfig(CITY_ID);
      expect(config.carousel).toEqual(items);
      expect('translations' in config.carousel[0]).toBe(true);
    });

    it('returns categories with translations intact', async () => {
      const { repo, service } = makeService();
      await repo.setCategories(CITY_ID, [
        makeCategory('cat-1', {
          translations: [
            { locale: 'fr', name: 'Sport' },
            { locale: 'en', name: 'Sports' },
          ],
        }),
      ]);
      const config = await service.getMunicipalityConfig(CITY_ID);
      expect(config.categories[0].translations).toHaveLength(2);
    });
  });

  describe('setCategories', () => {
    it('persists and returns the new category list', async () => {
      const { service } = makeService();
      const cats = [makeCategory('cat-1', { translations: [{ locale: 'fr', name: 'Sport' }] })];
      const result = await service.setCategories(CITY_ID, cats);
      expect(result).toEqual(cats);
    });

    it('replaces previous categories entirely', async () => {
      const { service } = makeService();
      await service.setCategories(CITY_ID, [makeCategory('old')]);
      await service.setCategories(CITY_ID, [makeCategory('new')]);
      const config = await service.getMunicipalityConfig(CITY_ID);
      expect(config.categories).toHaveLength(1);
      expect(config.categories[0].id).toBe('new');
    });
  });

  describe('setCarouselItems', () => {
    it('persists items and returns them', async () => {
      const { service } = makeService();
      const items = [makeCarouselItem('c1', { order: 5 })];
      expect(await service.setCarouselItems(CITY_ID, items)).toEqual(items);
    });

    it('replaces previous items entirely', async () => {
      const { service } = makeService();
      await service.setCarouselItems(CITY_ID, [makeCarouselItem('old')]);
      await service.setCarouselItems(CITY_ID, [makeCarouselItem('new')]);
      const config = await service.getMunicipalityConfig(CITY_ID);
      expect(config.carousel[0].id).toBe('new');
    });

    it('adds a carousel media link when imageUrl matches a known media entry', async () => {
      const repo = new InMemoryConfigRepository();
      const mediaRepo = new InMemoryMediaRepository();
      const service = new ConfigService(repo, mediaRepo);
      const mediaUrl = 'https://blob.example.com/slide.jpg';
      await mediaRepo.create({
        id: 'media-1',
        title: 'Slide',
        url: mediaUrl,
        storagePath: 'city/slide.jpg',
        cityId: CITY_ID,
        createdAt: new Date().toISOString(),
        links: [],
      });

      await service.setCarouselItems(CITY_ID, [
        makeCarouselItem('slide-1', { imageUrl: mediaUrl, translations: [{ locale: 'fr', title: 'Slide' }] }),
      ]);

      const media = await mediaRepo.findById('media-1');
      expect(media?.links.some((l) => l.type === 'carousel' && l.idLink === 'slide-1')).toBe(true);
    });

    it('removes stale carousel media links when an item is deleted', async () => {
      const repo = new InMemoryConfigRepository();
      const mediaRepo = new InMemoryMediaRepository();
      const service = new ConfigService(repo, mediaRepo);
      await mediaRepo.create({
        id: 'media-1',
        title: 'Slide',
        url: 'https://blob.example.com/slide.jpg',
        storagePath: 'city/slide.jpg',
        cityId: CITY_ID,
        createdAt: new Date().toISOString(),
        links: [{ idLink: 'old-slide', type: 'carousel', title: 'Old' }],
      });

      await service.setCarouselItems(CITY_ID, []);

      const media = await mediaRepo.findById('media-1');
      expect(media?.links.filter((l) => l.type === 'carousel')).toHaveLength(0);
    });
  });
});
