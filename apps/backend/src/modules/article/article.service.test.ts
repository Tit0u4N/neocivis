import { describe, expect, it } from 'vitest';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  const makeService = () => {
    const repository = new ArticleRepository();
    const service = new ArticleService(repository);
    return { repository, service };
  };

  describe('getAllArticles', () => {
    it('should return all articles', async () => {
      const { service } = makeService();
      const articles = await service.getAllArticles();
      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe('getPublishedArticles', () => {
    it('should return only published articles', async () => {
      const { service } = makeService();
      const articles = await service.getPublishedArticles();
      expect(articles.every((a) => a.status === 'published')).toBe(true);
    });

    it('should not include draft articles', async () => {
      const { service } = makeService();
      const articles = await service.getPublishedArticles();
      expect(articles.some((a) => a.status === 'draft')).toBe(false);
    });
  });

  describe('getArticleById', () => {
    it('should return the article when found', async () => {
      const { service } = makeService();
      const all = await service.getAllArticles();
      const article = await service.getArticleById(all[0].id);
      expect(article.id).toBe(all[0].id);
    });

    it('should throw when article is not found', async () => {
      const { service } = makeService();
      await expect(service.getArticleById('non-existing-id')).rejects.toThrow('Article not found');
    });
  });

  describe('createArticle', () => {
    it('should create an article with a generated id and timestamps', async () => {
      const { service } = makeService();
      const article = await service.createArticle(
        {
          translation: { locale: 'fr', title: 'Titre test', description: 'Desc', content: [] },
          status: 'draft',
        },
        'author-1',
      );
      expect(article.id).toBeDefined();
      expect(article.authorId).toBe('author-1');
      expect(article.translations).toHaveLength(1);
      expect(article.translations[0].locale).toBe('fr');
      expect(article.createdAt).toBeDefined();
      expect(article.updatedAt).toBeDefined();
    });

    it('should force the translation locale to fr', async () => {
      const { service } = makeService();
      const article = await service.createArticle(
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
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Original', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateArticle(created.id, {
        coverImageUrl: 'https://example.com/img.jpg',
      });
      expect(updated.coverImageUrl).toBe('https://example.com/img.jpg');
    });

    it('should throw when article is not found', async () => {
      const { service } = makeService();
      await expect(service.updateArticle('missing-id', {})).rejects.toThrow('Article not found');
    });
  });

  describe('deleteArticle', () => {
    it('should delete an existing article', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'À supprimer', content: [] }, status: 'draft' },
        'author-1',
      );
      await service.deleteArticle(created.id);
      await expect(service.getArticleById(created.id)).rejects.toThrow('Article not found');
    });

    it('should throw when article is not found', async () => {
      const { service } = makeService();
      await expect(service.deleteArticle('missing-id')).rejects.toThrow('Article not found');
    });
  });

  describe('updateStatus', () => {
    it('should change status to published and set publishedAt', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Brouillon', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateStatus(created.id, { status: 'published' });
      expect(updated.status).toBe('published');
      expect(updated.publishedAt).toBeDefined();
    });

    it('should not overwrite publishedAt when re-publishing', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      const first = await service.updateStatus(created.id, { status: 'published' });
      const firstPublishedAt = first.publishedAt;
      const second = await service.updateStatus(created.id, { status: 'published' });
      expect(second.publishedAt).toBe(firstPublishedAt);
    });

    it('should change status back to draft', async () => {
      const { service } = makeService();
      const all = await service.getAllArticles();
      const published = all.find((a) => a.status === 'published');
      expect(published).toBeDefined();
      if (!published) {
        throw new Error('Expected a published article in mock data');
      }
      const updated = await service.updateStatus(published.id, { status: 'draft' });
      expect(updated.status).toBe('draft');
    });
  });

  describe('addTranslation', () => {
    it('should add a new translation to an existing article', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.addTranslation(created.id, {
        locale: 'en',
        title: 'Article EN',
        content: [],
      });
      expect(updated.translations).toHaveLength(2);
      expect(updated.translations.some((t) => t.locale === 'en')).toBe(true);
    });

    it('should throw when adding a duplicate locale', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await service.addTranslation(created.id, { locale: 'en', title: 'EN', content: [] });
      await expect(
        service.addTranslation(created.id, { locale: 'en', title: 'EN duplicate', content: [] }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateTranslation', () => {
    it('should update an existing translation', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Original', content: [] }, status: 'draft' },
        'author-1',
      );
      const updated = await service.updateTranslation(created.id, 'fr', { title: 'Modifié' });
      const frTranslation = updated.translations.find((t) => t.locale === 'fr');
      expect(frTranslation?.title).toBe('Modifié');
    });

    it('should throw when the translation does not exist', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await expect(service.updateTranslation(created.id, 'en', { title: 'EN' })).rejects.toThrow('not found');
    });
  });

  describe('deleteTranslation', () => {
    it('should delete a non-fr translation', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await service.addTranslation(created.id, { locale: 'en', title: 'EN', content: [] });
      const updated = await service.deleteTranslation(created.id, 'en');
      expect(updated.translations.some((t) => t.locale === 'en')).toBe(false);
    });

    it('should throw when trying to delete the fr translation', async () => {
      const { service } = makeService();
      const created = await service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: [] }, status: 'draft' },
        'author-1',
      );
      await expect(service.deleteTranslation(created.id, 'fr')).rejects.toThrow(
        "Cannot delete the default 'fr' translation",
      );
    });
  });
});
