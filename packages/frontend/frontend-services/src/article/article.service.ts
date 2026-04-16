import type {
  AddTranslationInput,
  Article,
  CreateArticleInput,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class ArticleService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, '');
  }

  async getAll(): Promise<Article[]> {
    const res = await this.http.get('articles').json<Article[]>();
    return res;
  }

  async getById(id: string): Promise<Article> {
    return await this.http.get(`articles/${id}`).json<Article>();
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
