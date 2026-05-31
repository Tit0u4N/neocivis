import type { Article, ArticleWithResolvedTranslation, PaginatedArticlesResponse } from '@repo/contracts/article';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleService } from './article.service';

const CITY_ID = 'NIC_06000';

const mockArticle: Article = {
  id: '00000000-0000-0000-0000-000000000001',
  cityId: CITY_ID as Article['cityId'],
  translations: [{ locale: 'fr', title: 'Test Article' }],
  status: 'draft',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  authorId: 'user-1',
};

const mockArticleResolved: ArticleWithResolvedTranslation = {
  id: '00000000-0000-0000-0000-000000000001',
  cityId: CITY_ID as ArticleWithResolvedTranslation['cityId'],
  translation: { locale: 'fr', title: 'Test Article' },
  status: 'draft',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  authorId: 'user-1',
};

const mockPaginated: PaginatedArticlesResponse = {
  data: [mockArticleResolved],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

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

describe('ArticleService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: ArticleService;

  beforeEach(() => {
    ky = makeKy();
    service = new ArticleService(ky, CITY_ID);
  });

  describe('getAll', () => {
    it('calls GET articles and returns the article list', async () => {
      const json = vi.fn().mockResolvedValue([mockArticle]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getAll();

      expect(ky.get).toHaveBeenCalledWith('articles');
      expect(result).toEqual([mockArticle]);
    });
  });

  describe('getById', () => {
    it('calls GET articles/:id and returns the article', async () => {
      const json = vi.fn().mockResolvedValue(mockArticle);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getById('art-1');

      expect(ky.get).toHaveBeenCalledWith('articles/art-1');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('getPublished', () => {
    it('calls GET articles with empty searchParams when no params given', async () => {
      const json = vi.fn().mockResolvedValue(mockPaginated);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getPublished();

      expect(ky.get).toHaveBeenCalledWith('articles', { searchParams: {} });
      expect(result).toEqual(mockPaginated);
    });

    it('forwards preferredLocale, page and limit as searchParams', async () => {
      const json = vi.fn().mockResolvedValue(mockPaginated);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      await service.getPublished({ preferredLocale: 'en', page: 2, limit: 5 });

      expect(ky.get).toHaveBeenCalledWith('articles', {
        searchParams: { preferredLocale: 'en', page: 2, limit: 5 },
      });
    });
  });

  describe('getByIdResolved', () => {
    it('calls GET articles/:id with default locale fr', async () => {
      const json = vi.fn().mockResolvedValue(mockArticleResolved);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getByIdResolved('art-1');

      expect(ky.get).toHaveBeenCalledWith('articles/art-1', { searchParams: { preferredLocale: 'fr' } });
      expect(result).toEqual(mockArticleResolved);
    });

    it('calls GET articles/:id with the specified locale', async () => {
      const json = vi.fn().mockResolvedValue(mockArticleResolved);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      await service.getByIdResolved('art-1', 'en');

      expect(ky.get).toHaveBeenCalledWith('articles/art-1', { searchParams: { preferredLocale: 'en' } });
    });
  });

  describe('create', () => {
    it('calls POST articles with json body and returns the created article', async () => {
      const json = vi.fn().mockResolvedValue(mockArticle);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { translation: { locale: 'fr' as const, title: 'New Article' }, status: 'draft' as const };
      const result = await service.create(input);

      expect(ky.post).toHaveBeenCalledWith('articles', { json: input });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('calls PUT articles/:id with json body and returns the updated article', async () => {
      const json = vi.fn().mockResolvedValue(mockArticle);
      (ky.put as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { translation: { locale: 'fr' as const, title: 'Updated Article' } };
      const result = await service.update('art-1', input);

      expect(ky.put).toHaveBeenCalledWith('articles/art-1', { json: input });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('delete', () => {
    it('calls DELETE articles/:id', async () => {
      await service.delete('art-1');

      expect(ky.delete).toHaveBeenCalledWith('articles/art-1');
    });
  });

  describe('updateStatus', () => {
    it('calls PATCH articles/:id/status with json body', async () => {
      const published = { ...mockArticle, status: 'published' as const };
      const json = vi.fn().mockResolvedValue(published);
      (ky.patch as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.updateStatus('art-1', { status: 'published' });

      expect(ky.patch).toHaveBeenCalledWith('articles/art-1/status', { json: { status: 'published' } });
      expect(result.status).toBe('published');
    });
  });

  describe('addTranslation', () => {
    it('calls POST articles/:id/translations with json body', async () => {
      const json = vi.fn().mockResolvedValue(mockArticle);
      (ky.post as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { locale: 'en' as const, title: 'English title' };
      const result = await service.addTranslation('art-1', input);

      expect(ky.post).toHaveBeenCalledWith('articles/art-1/translations', { json: input });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('updateTranslation', () => {
    it('calls PUT articles/:id/translations/:locale with json body', async () => {
      const json = vi.fn().mockResolvedValue(mockArticle);
      (ky.put as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const input = { title: 'Updated English title' };
      const result = await service.updateTranslation('art-1', 'en', input);

      expect(ky.put).toHaveBeenCalledWith('articles/art-1/translations/en', { json: input });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('deleteTranslation', () => {
    it('calls DELETE articles/:id/translations/:locale and returns the article', async () => {
      const json = vi.fn().mockResolvedValue(mockArticle);
      (ky.delete as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.deleteTranslation('art-1', 'en');

      expect(ky.delete).toHaveBeenCalledWith('articles/art-1/translations/en');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('constructor', () => {
    it('is city-scoped when cityId is provided', () => {
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
      const kyInstance = base as unknown as KyInstance;

      new ArticleService(kyInstance, 'NIC_06000');

      const factory = (base.extend as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const opts = factory({ prefixUrl: 'http://api' });
      expect(opts.prefixUrl).toBe('http://api/cities/NIC_06000');
    });

    it('is not city-scoped when no cityId is provided', () => {
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
      const kyInstance = base as unknown as KyInstance;

      new ArticleService(kyInstance);

      const factory = (base.extend as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const opts = factory({ prefixUrl: 'http://api' });
      expect(opts.prefixUrl).toBe('http://api');
    });
  });
});
