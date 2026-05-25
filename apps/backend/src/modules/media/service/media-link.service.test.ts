import { describe, expect, it } from 'vitest';
import { collectArticleImageUrls } from '@/modules/media/article-image-urls';
import { InMemoryMediaRepository } from '@/modules/media/repository/media.inmemory.repository';
import { MediaLinkService } from '@/modules/media/service/media-link.service';

describe('MediaLinkService', () => {
  it('registers cover and inline article images on sync', async () => {
    const mediaRepository = new InMemoryMediaRepository();
    const coverUrl = 'http://127.0.0.1:10000/devstoreaccount1/media/NIC/seed/cover.jpg';
    const inlineUrl = 'http://127.0.0.1:10000/devstoreaccount1/media/NIC/seed/inline.jpg';

    await mediaRepository.create({
      id: 'a1000001-0000-4000-8000-000000000004',
      title: 'Cover',
      url: coverUrl,
      storagePath: 'NIC/seed/cover.jpg',
      cityId: 'NIC_00001',
      createdAt: new Date().toISOString(),
      links: [],
    });
    await mediaRepository.create({
      id: 'a1000001-0000-4000-8000-000000000006',
      title: 'Inline',
      url: inlineUrl,
      storagePath: 'NIC/seed/inline.jpg',
      cityId: 'NIC_00001',
      createdAt: new Date().toISOString(),
      links: [],
    });

    const service = new MediaLinkService(mediaRepository);
    await service.syncArticleMediaLinks({
      id: '11111111-1111-1111-1111-111111111111',
      cityId: 'NIC_00001',
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

  it('collectArticleImageUrls gathers cover and nested inline urls', () => {
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
});
