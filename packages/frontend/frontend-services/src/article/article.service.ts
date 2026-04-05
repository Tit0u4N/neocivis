import type {
  AddTranslationInput,
  Article,
  CreateArticleInput,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import ky from 'ky';

const BASE_URL = '/api/municipality/articles';

export class ArticleService {
  private http = ky.create({ prefixUrl: BASE_URL });

  async getAll(): Promise<Article[]> {
    return await this.http.get('').json<Article[]>();
  }

  async getById(id: string): Promise<Article> {
    return await this.http.get(id).json<Article>();
  }

  async create(input: CreateArticleInput): Promise<Article> {
    return await this.http.post('', { json: input }).json<Article>();
  }

  async update(id: string, input: UpdateArticleInput): Promise<Article> {
    return await this.http.put(id, { json: input }).json<Article>();
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(id);
  }

  async updateStatus(id: string, input: UpdateStatusInput): Promise<Article> {
    return await this.http.patch(`${id}/status`, { json: input }).json<Article>();
  }

  async addTranslation(id: string, input: AddTranslationInput): Promise<Article> {
    return await this.http.post(`${id}/translations`, { json: input }).json<Article>();
  }

  async updateTranslation(id: string, locale: string, input: Partial<AddTranslationInput>): Promise<Article> {
    return await this.http.put(`${id}/translations/${locale}`, { json: input }).json<Article>();
  }

  async deleteTranslation(id: string, locale: string): Promise<Article> {
    return await this.http.delete(`${id}/translations/${locale}`).json<Article>();
  }
}
