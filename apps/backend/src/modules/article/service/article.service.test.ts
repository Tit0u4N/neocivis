import { describe, expect, it } from 'vitest';
import type { CityService } from '@/modules/city/city.service';
import { InMemoryArticleRepository } from '../repository/article.inmemory.repository';
import { ArticleSeeder } from '../seed/article.seeder';
import { ArticleService } from './article.service';

const CITY_ID = 'NIC_00001';

describe('ArticleService', () => {
  const makeService = async () => {
    const repository = new InMemoryArticleRepository();
    const cityService = {
      listPublicCities: async () => [{ id: CITY_ID, name: 'Nice', description: 'Ville de Nice' }],
    } as unknown as CityService;
    const seeder = new ArticleSeeder(repository, cityService);
    await seeder.seed();
    const service = new ArticleService(repository);
    return { repository, service };
  };

  describe('getAllArticles', () => {
    it('should return all articles for the city', async () => {
      const { service } = await makeService();
      const articles = await service.getAllArticles(CITY_ID);
      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
      expect(articles.every((a) => a.cityId === CITY_ID)).toBe(true);
    });
  });

  describe('getPublishedArticles', () => {
    it('should return only published articles', async () => {
      const { service } = await makeService();
      const articles = await service.getPublishedArticles();
      expect(articles.every((a) => a.status === 'published')).toBe(true);
    });

    it('should not include draft articles', async () => {
      const { service } = await makeService();
      const articles = await service.getPublishedArticles();
      expect(articles.some((a) => a.status === 'draft')).toBe(false);
    });
  });

  describe('getArticleById', () => {
    it('should return the article when found in the city', async () => {
      const { service } = await makeService();
      const all = await service.getAllArticles(CITY_ID);
      const article = await service.getArticleById(CITY_ID, all[0].id);
      expect(article.id).toBe(all[0].id);
    });

    it('should throw when article is not found', async () => {
      const { service } = await makeService();
      await expect(service.getArticleById(CITY_ID, 'non-existing-id')).rejects.toThrow('Article not found');
    });
  });

  describe('createArticle', () => {
    it('should create an article with a generated id and timestamps', async () => {
      const { service } = await makeService();
      const article = await service.createArticle(
        CITY_ID,
        {
          translation: { locale: 'fr', title: 'Titre test', description: 'Desc', content: [] },
          status: 'draft',
        },
        'author-1',
      );
      expect(article.id).toBeDefined();
      expect(article.cityId).toBe(CITY_ID);
      expect(article.authorId).toBe('author-1');
      expect(article.translations).toHaveLength(1);
      expect(article.translations[0].locale).toBe('fr');
      expect(article.createdAt).toBeDefined();
      expect(article.updatedAt).toBeDefined();
    });

    it('should force the translation locale to fr', async () => {
      const { service } = await makeService();
      const article = await service.createArticle(
        CITY_ID,
        {
          translation: { locale: 'en', title: 'Test', content: [] },
          status: 'draft',
        },
        'author-1',
      );
      expect(article.translations[0].locale).toBe('fr');
    });
  });

  describe('updateArticle', () => {
    it('should update article fields and refresh updatedAt', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Original', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateArticle(CITY_ID, created.id, {
        coverImageUrl: 'https://example.com/img.jpg',
      });
      expect(updated.coverImageUrl).toBe('https://example.com/img.jpg');
    });

    it('should persist french translation changes on update', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Original', description: 'Avant', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateArticle(CITY_ID, created.id, {
        translation: {
          locale: 'fr',
          title: 'Modifié',
          description: 'Après',
          content: [{ type: 'p', children: [{ text: 'Nouveau contenu' }] }],
        },
      });
      const fr = updated.translations.find((t) => t.locale === 'fr');
      expect(fr?.title).toBe('Modifié');
      expect(fr?.description).toBe('Après');
      expect(fr?.content).toEqual([{ type: 'p', children: [{ text: 'Nouveau contenu' }] }]);
    });

    it('should throw when article is not found', async () => {
      const { service } = await makeService();
      await expect(service.updateArticle(CITY_ID, 'missing-id', {})).rejects.toThrow('Article not found');
    });
  });

  describe('deleteArticle', () => {
    it('should delete an existing article', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'À supprimer', content: [] }, status: 'draft' },
        'author-1',
      );
      await service.deleteArticle(CITY_ID, created.id);
      await expect(service.getArticleById(CITY_ID, created.id)).rejects.toThrow('Article not found');
    });

    it('should throw when article is not found', async () => {
      const { service } = await makeService();
      await expect(service.deleteArticle(CITY_ID, 'missing-id')).rejects.toThrow('Article not found');
    });
  });

  describe('updateStatus', () => {
    it('should change status to published and set publishedAt', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Brouillon', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateStatus(CITY_ID, created.id, { status: 'published' });
      expect(updated.status).toBe('published');
      expect(updated.publishedAt).toBeDefined();
    });

    it('should not overwrite publishedAt when re-publishing', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      const first = await service.updateStatus(CITY_ID, created.id, { status: 'published' });
      const firstPublishedAt = first.publishedAt;
      const second = await service.updateStatus(CITY_ID, created.id, { status: 'published' });
      expect(second.publishedAt).toBe(firstPublishedAt);
    });

    it('should change status back to draft', async () => {
      const { service } = await makeService();
      const all = await service.getAllArticles(CITY_ID);
      const published = all.find((a) => a.status === 'published');
      expect(published).toBeDefined();
      if (!published) {
        throw new Error('Expected a published article in mock data');
      }
      const updated = await service.updateStatus(CITY_ID, published.id, { status: 'draft' });
      expect(updated.status).toBe('draft');
    });
  });

  describe('addTranslation', () => {
    it('should add a new translation to an existing article', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.addTranslation(CITY_ID, created.id, {
        locale: 'en',
        title: 'Article EN',
        content: [],
      });
      expect(updated.translations).toHaveLength(2);
      expect(updated.translations.some((t) => t.locale === 'en')).toBe(true);
    });

    it('should throw when adding a duplicate locale', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await service.addTranslation(CITY_ID, created.id, { locale: 'en', title: 'EN', content: [] });
      await expect(
        service.addTranslation(CITY_ID, created.id, { locale: 'en', title: 'EN duplicate', content: [] }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateTranslation', () => {
    it('should update an existing translation', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Original', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateTranslation(CITY_ID, created.id, 'fr', { title: 'Modifié' });
      const frTranslation = updated.translations.find((t) => t.locale === 'fr');
      expect(frTranslation?.title).toBe('Modifié');
    });

    it('should throw when the translation does not exist', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await expect(service.updateTranslation(CITY_ID, created.id, 'en', { title: 'EN' })).rejects.toThrow('not found');
    });
  });

  describe('deleteTranslation', () => {
    it('should delete a non-fr translation', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await service.addTranslation(CITY_ID, created.id, { locale: 'en', title: 'EN', content: [] });
      const updated = await service.deleteTranslation(CITY_ID, created.id, 'en');
      expect(updated.translations.some((t) => t.locale === 'en')).toBe(false);
    });

    it('should throw when trying to delete the fr translation', async () => {
      const { service } = await makeService();
      const created = await service.createArticle(
        CITY_ID,
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await expect(service.deleteTranslation(CITY_ID, created.id, 'fr')).rejects.toThrow(
        "Cannot delete the default 'fr' translation",
      );
    });
  });
});
