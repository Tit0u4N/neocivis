import { randomUUID } from 'node:crypto';
import type {
  AddTranslationInput,
  Article,
  ArticleLocale,
  ArticleTranslation,
  ArticleWithResolvedTranslation,
  CreateArticleInput,
  PaginatedArticlesResponse,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import type { MediaLinkService } from '@/modules/media/service/media-link.service';
import type { IArticleRepository } from '../repository/article.repository.interface';

export class ArticleService {
  constructor(
    private repository: IArticleRepository,
    private mediaLinkService?: MediaLinkService,
  ) {}

  getAllArticles(cityId: string): Promise<Article[]> {
    return this.repository.findAllByCityId(cityId);
  }

  getPublishedArticles(): Promise<Article[]> {
    return this.repository.findAllPublished();
  }

  async getArticleById(cityId: string, id: string): Promise<Article> {
    const article = await this.repository.findByIdAndCityId(id, cityId);
    if (!article) {
      throw new Error(`Article not found: ${id}`);
    }
    return article;
  }

  async createArticle(cityId: string, input: CreateArticleInput, authorId: string): Promise<Article> {
    const translation = { ...input.translation, locale: 'fr' as const };
    const article = await this.repository.create({
      ...input,
      translation,
      id: randomUUID(),
      cityId,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.syncMediaLinks(article);
    return article;
  }

  async updateArticle(cityId: string, id: string, input: UpdateArticleInput): Promise<Article> {
    const existing = await this.getArticleById(cityId, id);
    let translations = existing.translations;

    if (input.translation) {
      const locale = input.translation.locale ?? 'fr';
      const index = translations.findIndex((t) => t.locale === locale);
      if (index === -1) {
        translations = [...translations, { ...input.translation, locale } as ArticleTranslation];
      } else {
        translations = translations.map((t, i) =>
          i === index ? ({ ...t, ...input.translation, locale: t.locale } as ArticleTranslation) : t,
        );
      }
    }

    const status = input.status ?? existing.status;
    const patch: Partial<Article> = {
      ...existing,
      translations,
      coverImageUrl: input.coverImageUrl ?? existing.coverImageUrl,
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'published' && existing.status !== 'published') {
      patch.publishedAt = new Date().toISOString();
    }

    const updated = await this.repository.update(id, patch);
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    await this.syncMediaLinks(updated);
    return updated;
  }

  async deleteArticle(cityId: string, id: string): Promise<void> {
    await this.getArticleById(cityId, id);
    await this.mediaLinkService?.removeArticleMediaLinks(cityId, id);
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Article not found: ${id}`);
    }
  }

  async updateStatus(cityId: string, id: string, input: UpdateStatusInput): Promise<Article> {
    const existing = await this.getArticleById(cityId, id);
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

  async addTranslation(cityId: string, id: string, input: AddTranslationInput): Promise<Article> {
    const existing = await this.getArticleById(cityId, id);
    const hasDuplicate = existing.translations.some((t) => t.locale === input.locale);
    if (hasDuplicate) {
      throw new Error(`Translation for locale '${input.locale}' already exists`);
    }
    const updated = await this.repository.addTranslation(id, input);
    if (!updated) {
      throw new Error(`Article not found: ${id}`);
    }
    await this.syncMediaLinks(updated);
    return updated;
  }

  async updateTranslation(
    cityId: string,
    id: string,
    locale: ArticleLocale,
    input: Partial<AddTranslationInput>,
  ): Promise<Article> {
    await this.getArticleById(cityId, id);
    const updated = await this.repository.updateTranslation(id, locale, input);
    if (!updated) {
      throw new Error(`Translation for locale '${locale}' not found on article '${id}'`);
    }
    await this.syncMediaLinks(updated);
    return updated;
  }

  async deleteTranslation(cityId: string, id: string, locale: ArticleLocale): Promise<Article> {
    if (locale === 'fr') {
      throw new Error("Cannot delete the default 'fr' translation");
    }
    await this.getArticleById(cityId, id);
    const updated = await this.repository.deleteTranslation(id, locale);
    if (!updated) {
      throw new Error(`Translation for locale '${locale}' not found on article '${id}'`);
    }
    await this.syncMediaLinks(updated);
    return updated;
  }

  private async syncMediaLinks(article: Article): Promise<void> {
    await this.mediaLinkService?.syncArticleMediaLinks(article);
  }

  private resolveTranslation(translations: ArticleTranslation[], preferredLocale: ArticleLocale): ArticleTranslation {
    const byPreferred = translations.find((t) => t.locale === preferredLocale);
    if (byPreferred) {
      return byPreferred;
    }
    const byDefault = translations.find((t) => t.locale === 'fr');
    if (byDefault) {
      return byDefault;
    }
    const first = translations[0];
    if (!first) {
      throw new Error('Article has no translations');
    }
    return first;
  }

  private resolveArticle(article: Article, preferredLocale: ArticleLocale): ArticleWithResolvedTranslation {
    const { translations, ...rest } = article;
    return { ...rest, translation: this.resolveTranslation(translations, preferredLocale) };
  }

  async getPublishedArticlesPaginated(
    page: number,
    limit: number,
    preferredLocale: ArticleLocale,
  ): Promise<PaginatedArticlesResponse> {
    const all = await this.repository.findAllPublished();
    return this.paginatePublished(all, page, limit, preferredLocale);
  }

  async getPublishedByCityPaginated(
    cityId: string,
    page: number,
    limit: number,
    preferredLocale: ArticleLocale,
  ): Promise<PaginatedArticlesResponse> {
    const all = await this.repository.findAllByCityId(cityId);
    const published = all.filter((a) => a.status === 'published');
    return this.paginatePublished(published, page, limit, preferredLocale);
  }

  async getArticleByIdResolved(id: string, preferredLocale: ArticleLocale): Promise<ArticleWithResolvedTranslation> {
    const article = await this.repository.findById(id);
    if (!article) {
      throw new Error(`Article not found: ${id}`);
    }
    return this.resolveArticle(article, preferredLocale);
  }

  async getPublishedArticleByIdAndCity(
    cityId: string,
    id: string,
    preferredLocale: ArticleLocale,
  ): Promise<ArticleWithResolvedTranslation> {
    const article = await this.repository.findByIdAndCityId(id, cityId);
    if (!article || article.status !== 'published') {
      throw new Error(`Article not found: ${id}`);
    }
    return this.resolveArticle(article, preferredLocale);
  }

  private paginatePublished(
    articles: Article[],
    page: number,
    limit: number,
    preferredLocale: ArticleLocale,
  ): PaginatedArticlesResponse {
    const sorted = [...articles].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = sorted.slice(offset, offset + limit).map((a) => this.resolveArticle(a, preferredLocale));
    return { data, total, page, limit, totalPages };
  }
}
