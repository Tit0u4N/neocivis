import { describe, expect, it } from 'vitest';
import { collectArticleImageUrls } from '@/modules/media/article-image-urls';
import { InMemoryMediaRepository } from '@/modules/media/repository/media.inmemory.repository';
import { MediaLinkService } from '@/modules/media/service/media-link.service';

const CITY_ID = 'NIC_00001';

async function seedMedia(
  repo: InMemoryMediaRepository,
  id: string,
  url: string,
  links: { idLink: string; type: string; title: string }[] = [],
) {
  return repo.create({
    id,
    title: 'Test image',
    url,
    storagePath: `city/${id}.jpg`,
    cityId: CITY_ID,
    createdAt: new Date().toISOString(),
    links,
  });
}

describe('MediaLinkService', () => {
  describe('syncArticleMediaLinks', () => {
    it('registers cover and inline article images on sync', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      const coverUrl = 'http://127.0.0.1:10000/devstoreaccount1/media/NIC/seed/cover.jpg';
      const inlineUrl = 'http://127.0.0.1:10000/devstoreaccount1/media/NIC/seed/inline.jpg';

      await seedMedia(mediaRepository, 'a1000001-0000-4000-8000-000000000004', coverUrl);
      await seedMedia(mediaRepository, 'a1000001-0000-4000-8000-000000000006', inlineUrl);

      const service = new MediaLinkService(mediaRepository);
      await service.syncArticleMediaLinks({
        id: '11111111-1111-1111-1111-111111111111',
        cityId: CITY_ID,
        coverImageUrl: coverUrl,
        status: 'published',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-15T10:00:00.000Z',
        authorId: 'user-1',
        translations: [
          {
            locale: 'fr',
            title: 'Mon article',
            content: [{ type: 'img', url: inlineUrl }],
          },
        ],
      });

      const cover = await mediaRepository.findById('a1000001-0000-4000-8000-000000000004');
      const inline = await mediaRepository.findById('a1000001-0000-4000-8000-000000000006');
      expect(cover?.links).toHaveLength(1);
      expect(inline?.links).toHaveLength(1);
      expect(cover?.links[0]?.type).toBe('articles');
    });

    it('is idempotent — does not add duplicate links', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      const imageUrl = 'https://blob.example.com/img.jpg';
      await seedMedia(mediaRepository, 'media-1', imageUrl);

      const service = new MediaLinkService(mediaRepository);
      const article = {
        id: 'article-1',
        cityId: CITY_ID,
        coverImageUrl: imageUrl,
        status: 'published' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        authorId: 'user-1',
        translations: [{ locale: 'fr', title: 'T', content: [] }],
      };
      await service.syncArticleMediaLinks(article);
      await service.syncArticleMediaLinks(article);

      const media = await mediaRepository.findById('media-1');
      expect(media?.links).toHaveLength(1);
    });

    it('removes the article link when the image is no longer referenced', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      const imageUrl = 'https://blob.example.com/img.jpg';
      await seedMedia(mediaRepository, 'media-1', imageUrl, [
        { idLink: 'article-1', type: 'articles', title: 'Old Article' },
      ]);

      const service = new MediaLinkService(mediaRepository);
      await service.syncArticleMediaLinks({
        id: 'article-1',
        cityId: CITY_ID,
        coverImageUrl: undefined,
        status: 'published' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        authorId: 'user-1',
        translations: [{ locale: 'fr', title: 'T', content: [] }],
      });

      const media = await mediaRepository.findById('media-1');
      expect(media?.links).toHaveLength(0);
    });
  });

  describe('removeArticleMediaLinks', () => {
    it('removes the targeted article link and preserves others', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      await seedMedia(mediaRepository, 'media-1', 'https://blob.example.com/img.jpg', [
        { idLink: 'article-1', type: 'articles', title: 'Article 1' },
        { idLink: 'article-2', type: 'articles', title: 'Article 2' },
      ]);

      await new MediaLinkService(mediaRepository).removeArticleMediaLinks(CITY_ID, 'article-1');

      const media = await mediaRepository.findById('media-1');
      expect(media?.links.some((l) => l.idLink === 'article-1')).toBe(false);
      expect(media?.links.some((l) => l.idLink === 'article-2')).toBe(true);
    });

    it('is a no-op when no matching links exist', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      await seedMedia(mediaRepository, 'media-1', 'https://blob.example.com/img.jpg');
      await expect(
        new MediaLinkService(mediaRepository).removeArticleMediaLinks(CITY_ID, 'non-existent'),
      ).resolves.toBeUndefined();
    });
  });

  describe('syncEstablishmentMediaLinks', () => {
    it('adds an establishment link when imageUrl matches a known media entry', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      const imageUrl = 'https://blob.example.com/est.jpg';
      await seedMedia(mediaRepository, 'media-1', imageUrl);

      await new MediaLinkService(mediaRepository).syncEstablishmentMediaLinks({
        id: 'est-1',
        cityId: CITY_ID,
        imageUrl,
        name: 'Mairie Centrale',
      });

      const media = await mediaRepository.findById('media-1');
      expect(media?.links.some((l) => l.type === 'establishments' && l.idLink === 'est-1')).toBe(true);
    });

    it('is idempotent — does not add duplicate establishment links', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      const imageUrl = 'https://blob.example.com/est.jpg';
      await seedMedia(mediaRepository, 'media-1', imageUrl);

      const service = new MediaLinkService(mediaRepository);
      const est = { id: 'est-1', cityId: CITY_ID, imageUrl, name: 'Mairie' };
      await service.syncEstablishmentMediaLinks(est);
      await service.syncEstablishmentMediaLinks(est);

      const media = await mediaRepository.findById('media-1');
      expect(media?.links).toHaveLength(1);
    });

    it('removes the stale link when the establishment imageUrl changes', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      const imageUrl = 'https://blob.example.com/est.jpg';
      await seedMedia(mediaRepository, 'media-1', imageUrl, [
        { idLink: 'est-1', type: 'establishments', title: 'Mairie' },
      ]);

      await new MediaLinkService(mediaRepository).syncEstablishmentMediaLinks({
        id: 'est-1',
        cityId: CITY_ID,
        imageUrl: undefined,
        name: 'Mairie',
      });

      const media = await mediaRepository.findById('media-1');
      expect(media?.links).toHaveLength(0);
    });
  });

  describe('removeEstablishmentMediaLinks', () => {
    it('removes the targeted establishment link and preserves others of the same type', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      await seedMedia(mediaRepository, 'media-1', 'https://blob.example.com/est.jpg', [
        { idLink: 'est-1', type: 'establishments', title: 'Mairie' },
        { idLink: 'est-2', type: 'establishments', title: 'École' },
      ]);

      await new MediaLinkService(mediaRepository).removeEstablishmentMediaLinks(CITY_ID, 'est-1');

      const media = await mediaRepository.findById('media-1');
      expect(media?.links.some((l) => l.idLink === 'est-1')).toBe(false);
      expect(media?.links.some((l) => l.idLink === 'est-2')).toBe(true);
    });

    it('preserves non-establishment links when removing', async () => {
      const mediaRepository = new InMemoryMediaRepository();
      await seedMedia(mediaRepository, 'media-1', 'https://blob.example.com/img.jpg', [
        { idLink: 'est-1', type: 'establishments', title: 'Mairie' },
        { idLink: 'art-1', type: 'articles', title: 'Article' },
      ]);

      await new MediaLinkService(mediaRepository).removeEstablishmentMediaLinks(CITY_ID, 'est-1');

      const media = await mediaRepository.findById('media-1');
      expect(media?.links).toHaveLength(1);
      expect(media?.links[0]?.type).toBe('articles');
    });
  });

  describe('collectArticleImageUrls', () => {
    it('gathers cover and nested inline urls', () => {
      const urls = collectArticleImageUrls({
        coverImageUrl: 'https://example.com/cover.jpg',
        translations: [
          {
            locale: 'fr',
            title: 'T',
            content: [{ type: 'img', url: 'https://example.com/inline.jpg', children: [] }],
          },
        ],
      });
      expect(urls.has('https://example.com/cover.jpg')).toBe(true);
      expect(urls.has('https://example.com/inline.jpg')).toBe(true);
    });

    it('ignores a missing coverImageUrl', () => {
      const urls = collectArticleImageUrls({
        coverImageUrl: undefined,
        translations: [{ locale: 'fr', title: 'T', content: [] }],
      });
      expect(urls.size).toBe(0);
    });

    it('returns an empty set when there are no images at all', () => {
      const urls = collectArticleImageUrls({
        coverImageUrl: undefined,
        translations: [],
      });
      expect(urls.size).toBe(0);
    });
  });
});
