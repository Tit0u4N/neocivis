import { randomUUID } from 'node:crypto';
import type {
  AddTranslationInput,
  Article,
  ArticleLocale,
  CreateArticleInput,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import type { ArticleRepository } from './article.repository';

export class ArticleService {
  constructor(private repository: ArticleRepository) {}

  getAllArticles(): Article[] {
    return this.repository.findAll();
  }

  getPublishedArticles(): Article[] {
    return this.repository.findAllPublished();
  }

  getArticleById(id: string): Article {
    const article = this.repository.findById(id);
    if (!article) {
      throw new Error(`Article not found: ${id}`);
    }
    return article;
  }

  createArticle(input: CreateArticleInput, authorId: string): Article {
    const translation = { ...input.translation, locale: 'fr' as const };
    return this.repository.create({
      ...input,
      translation,
      id: randomUUID(),
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  updateArticle(id: string, input: UpdateArticleInput): Article {
    const existing = this.getArticleById(id);
    const updated = this.repository.update(id, {
      ...existing,
      coverImageUrl: input.coverImageUrl ?? existing.coverImageUrl,
      status: input.status ?? existing.status,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    return updated;
  }

  deleteArticle(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Article not found: ${id}`);
    }
  }

  updateStatus(id: string, input: UpdateStatusInput): Article {
    const existing = this.getArticleById(id);
    const patch: Partial<Article> = {
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    if (input.status === 'published' && existing.status !== 'published') {
      patch.publishedAt = new Date().toISOString();
    }
    const updated = this.repository.update(id, patch);
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    return updated;
  }

  addTranslation(id: string, input: AddTranslationInput): Article {
    const existing = this.getArticleById(id);
    const hasDuplicate = existing.translations.some((t) => t.locale === input.locale);
    if (hasDuplicate) {
      throw new Error(`Translation for locale '${input.locale}' already exists`);
    }
    const updated = this.repository.addTranslation(id, input);
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    return updated;
  }

  updateTranslation(id: string, locale: ArticleLocale, input: Partial<AddTranslationInput>): Article {
    this.getArticleById(id);
    const updated = this.repository.updateTranslation(id, locale, input);
    if (!updated) {
      throw new Error(`Translation for locale '${locale}' not found on article '${id}'`);
    }
    return updated;
  }

  deleteTranslation(id: string, locale: ArticleLocale): Article {
    if (locale === 'fr') {
      throw new Error("Cannot delete the default 'fr' translation");
    }
    this.getArticleById(id);
    const updated = this.repository.deleteTranslation(id, locale);
    if (!updated) {
      throw new Error(`Translation for locale '${locale}' not found on article '${id}'`);
    }
    return updated;
  }
}
