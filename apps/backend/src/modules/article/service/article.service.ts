import { randomUUID } from 'node:crypto';
import type {
  AddTranslationInput,
  Article,
  ArticleLocale,
  CreateArticleInput,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import type { IArticleRepository } from '../repository/article.repository.interface';

export class ArticleService {
  constructor(private repository: IArticleRepository) {}

  getAllArticles(): Promise<Article[]> {
    return this.repository.findAll();
  }

  getPublishedArticles(): Promise<Article[]> {
    return this.repository.findAllPublished();
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.repository.findById(id);
    if (!article) {
      throw new Error(`Article not found: ${id}`);
    }
    return article;
  }

  createArticle(input: CreateArticleInput, authorId: string): Promise<Article> {
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

  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article> {
    const existing = await this.getArticleById(id);
    const updated = await this.repository.update(id, {
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

  async deleteArticle(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Article not found: ${id}`);
    }
  }

  async updateStatus(id: string, input: UpdateStatusInput): Promise<Article> {
    const existing = await this.getArticleById(id);
    const patch: Partial<Article> = {
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    if (input.status === 'published' && existing.status !== 'published') {
      patch.publishedAt = new Date().toISOString();
    }
    const updated = await this.repository.update(id, patch);
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    return updated;
  }

  async addTranslation(id: string, input: AddTranslationInput): Promise<Article> {
    const existing = await this.getArticleById(id);
    const hasDuplicate = existing.translations.some((t) => t.locale === input.locale);
    if (hasDuplicate) {
      throw new Error(`Translation for locale '${input.locale}' already exists`);
    }
    const updated = await this.repository.addTranslation(id, input);
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    return updated;
  }

  async updateTranslation(id: string, locale: ArticleLocale, input: Partial<AddTranslationInput>): Promise<Article> {
    await this.getArticleById(id);
    const updated = await this.repository.updateTranslation(id, locale, input);
    if (!updated) {
      throw new Error(`Translation for locale '${locale}' not found on article '${id}'`);
    }
    return updated;
  }

  async deleteTranslation(id: string, locale: ArticleLocale): Promise<Article> {
    if (locale === 'fr') {
      throw new Error("Cannot delete the default 'fr' translation");
    }
    await this.getArticleById(id);
    const updated = await this.repository.deleteTranslation(id, locale);
    if (!updated) {
      throw new Error(`Translation for locale '${locale}' not found on article '${id}'`);
    }
    return updated;
  }
}
