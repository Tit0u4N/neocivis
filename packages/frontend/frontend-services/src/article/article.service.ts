import type {
  AddTranslationInput,
  Article,
  ArticleWithResolvedTranslation,
  CreateArticleInput,
  PaginatedArticlesResponse,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export interface GetPublishedParams {
  preferredLocale?: string;
  page?: number;
  limit?: number;
}

export class ArticleService extends AbstractService {
  constructor(kyInstance: KyInstance, cityId?: string) {
    super(kyInstance, cityId ? { cityId } : { cityScoped: false });
  }

  async getAll(): Promise<Article[]> {
    return await this.http.get('articles').json<Article[]>();
  }

  async getById(id: string): Promise<Article> {
    return await this.http.get(`articles/${id}`).json<Article>();
  }

  async getPublished(params: GetPublishedParams = {}): Promise<PaginatedArticlesResponse> {
    const searchParams: Record<string, string | number> = {};
    if (params.preferredLocale) {
      searchParams.preferredLocale = params.preferredLocale;
    }
    if (params.page !== undefined) {
      searchParams.page = params.page;
    }
    if (params.limit !== undefined) {
      searchParams.limit = params.limit;
    }
    return await this.http.get('articles', { searchParams }).json<PaginatedArticlesResponse>();
  }

  async getByIdResolved(id: string, preferredLocale = 'fr'): Promise<ArticleWithResolvedTranslation> {
    return await this.http
      .get(`articles/${id}`, { searchParams: { preferredLocale } })
      .json<ArticleWithResolvedTranslation>();
  }

  async create(input: CreateArticleInput): Promise<Article> {
    return await this.http.post('articles', { json: input }).json<Article>();
  }

  async update(id: string, input: UpdateArticleInput): Promise<Article> {
    return await this.http.put(`articles/${id}`, { json: input }).json<Article>();
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`articles/${id}`);
  }

  async updateStatus(id: string, input: UpdateStatusInput): Promise<Article> {
    return await this.http.patch(`articles/${id}/status`, { json: input }).json<Article>();
  }

  async addTranslation(id: string, input: AddTranslationInput): Promise<Article> {
    return await this.http.post(`articles/${id}/translations`, { json: input }).json<Article>();
  }

  async updateTranslation(id: string, locale: string, input: Partial<AddTranslationInput>): Promise<Article> {
    return await this.http.put(`articles/${id}/translations/${locale}`, { json: input }).json<Article>();
  }

  async deleteTranslation(id: string, locale: string): Promise<Article> {
    return await this.http.delete(`articles/${id}/translations/${locale}`).json<Article>();
  }
}
