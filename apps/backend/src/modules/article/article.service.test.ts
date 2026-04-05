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
    it('should return all articles', () => {
      const { service } = makeService();
      const articles = service.getAllArticles();
      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe('getPublishedArticles', () => {
    it('should return only published articles', () => {
      const { service } = makeService();
      const articles = service.getPublishedArticles();
      expect(articles.every((a) => a.status === 'published')).toBe(true);
    });

    it('should not include draft articles', () => {
      const { service } = makeService();
      const articles = service.getPublishedArticles();
      expect(articles.some((a) => a.status === 'draft')).toBe(false);
    });
  });

  describe('getArticleById', () => {
    it('should return the article when found', () => {
      const { service } = makeService();
      const all = service.getAllArticles();
      const article = service.getArticleById(all[0].id);
      expect(article.id).toBe(all[0].id);
    });

    it('should throw when article is not found', () => {
      const { service } = makeService();
      expect(() => service.getArticleById('non-existing-id')).toThrow('Article not found');
    });
  });

  describe('createArticle', () => {
    it('should create an article with a generated id and timestamps', () => {
      const { service } = makeService();
      const article = service.createArticle(
        {
          translation: { locale: 'fr', title: 'Titre test', description: 'Desc', content: {} },
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

    it('should force the translation locale to fr', () => {
      const { service } = makeService();
      const article = service.createArticle(
        {
          translation: { locale: 'en', title: 'Test', content: {} },
          status: 'draft',
        },
        'author-1',
      );
      expect(article.translations[0].locale).toBe('fr');
    });
  });

  describe('updateArticle', () => {
    it('should update article fields and refresh updatedAt', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Original', content: {} }, status: 'draft' },
        'author-1',
      );
      const updated = service.updateArticle(created.id, {
        coverImageUrl: 'https://example.com/img.jpg',
      });
      expect(updated.coverImageUrl).toBe('https://example.com/img.jpg');
    });

    it('should throw when article is not found', () => {
      const { service } = makeService();
      expect(() => service.updateArticle('missing-id', {})).toThrow('Article not found');
    });
  });

  describe('deleteArticle', () => {
    it('should delete an existing article', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'À supprimer', content: {} }, status: 'draft' },
        'author-1',
      );
      service.deleteArticle(created.id);
      expect(() => service.getArticleById(created.id)).toThrow('Article not found');
    });

    it('should throw when article is not found', () => {
      const { service } = makeService();
      expect(() => service.deleteArticle('missing-id')).toThrow('Article not found');
    });
  });

  describe('updateStatus', () => {
    it('should change status to published and set publishedAt', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Brouillon', content: {} }, status: 'draft' },
        'author-1',
      );
      const updated = service.updateStatus(created.id, { status: 'published' });
      expect(updated.status).toBe('published');
      expect(updated.publishedAt).toBeDefined();
    });

    it('should not overwrite publishedAt when re-publishing', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: {} }, status: 'draft' },
        'author-1',
      );
      const first = service.updateStatus(created.id, { status: 'published' });
      const firstPublishedAt = first.publishedAt;
      const second = service.updateStatus(created.id, { status: 'published' });
      expect(second.publishedAt).toBe(firstPublishedAt);
    });

    it('should change status back to draft', () => {
      const { service } = makeService();
      const all = service.getAllArticles();
      const published = all.find((a) => a.status === 'published');
      expect(published).toBeDefined();
      const updated = service.updateStatus(published!.id, { status: 'draft' });
      expect(updated.status).toBe('draft');
    });
  });

  describe('addTranslation', () => {
    it('should add a new translation to an existing article', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: {} }, status: 'draft' },
        'author-1',
      );
      const updated = service.addTranslation(created.id, {
        locale: 'en',
        title: 'Article EN',
        content: {},
      });
      expect(updated.translations).toHaveLength(2);
      expect(updated.translations.some((t) => t.locale === 'en')).toBe(true);
    });

    it('should throw when adding a duplicate locale', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: {} }, status: 'draft' },
        'author-1',
      );
      service.addTranslation(created.id, { locale: 'en', title: 'EN', content: {} });
      expect(() => service.addTranslation(created.id, { locale: 'en', title: 'EN duplicate', content: {} })).toThrow(
        'already exists',
      );
    });
  });

  describe('updateTranslation', () => {
    it('should update an existing translation', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Original', content: {} }, status: 'draft' },
        'author-1',
      );
      const updated = service.updateTranslation(created.id, 'fr', { title: 'Modifié' });
      const frTranslation = updated.translations.find((t) => t.locale === 'fr');
      expect(frTranslation?.title).toBe('Modifié');
    });

    it('should throw when the translation does not exist', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: {} }, status: 'draft' },
        'author-1',
      );
      expect(() => service.updateTranslation(created.id, 'en', { title: 'EN' })).toThrow('not found');
    });
  });

  describe('deleteTranslation', () => {
    it('should delete a non-fr translation', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: {} }, status: 'draft' },
        'author-1',
      );
      service.addTranslation(created.id, { locale: 'en', title: 'EN', content: {} });
      const updated = service.deleteTranslation(created.id, 'en');
      expect(updated.translations.some((t) => t.locale === 'en')).toBe(false);
    });

    it('should throw when trying to delete the fr translation', () => {
      const { service } = makeService();
      const created = service.createArticle(
        { translation: { locale: 'fr', title: 'Article', content: {} }, status: 'draft' },
        'author-1',
      );
      expect(() => service.deleteTranslation(created.id, 'fr')).toThrow("Cannot delete the default 'fr' translation");
    });
  });
});
