import type { Container } from '@azure/cosmos';
import type { Article, ArticleLocale, ArticleTranslation, CreateArticleInput } from '@repo/contracts/article';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { getCosmosContainer } from '@/infrastructure/azure/cosmos.setup';
import { optionalEnv } from '@/infrastructure/env';
import type { IArticleRepository } from './article.repository.interface';

export function isCosmosConfigured(): boolean {
  return Boolean(optionalEnv('COSMOS_ENDPOINT') && optionalEnv('COSMOS_KEY'));
}

export class CosmosArticleRepository implements IArticleRepository {
  private cosmosContainer: Container | null = null;

  private async getContainer(): Promise<Container> {
    if (this.cosmosContainer) {
      return this.cosmosContainer;
    }

    const client = getCosmosClient();
    const container = await getCosmosContainer(client, 'articles');

    this.cosmosContainer = container;
    return container;
  }

  async findAll(): Promise<Article[]> {
    const container = await this.getContainer();
    const { resources } = await container.items.query<Article>('SELECT * FROM c').fetchAll();
    return resources;
  }

  async findAllByCityId(cityId: string): Promise<Article[]> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<Article>({
        query: 'SELECT * FROM c WHERE c.cityId = @cityId',
        parameters: [{ name: '@cityId', value: cityId }],
      })
      .fetchAll();
    return resources;
  }

  async findAllPublished(): Promise<Article[]> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<Article>({
        query: 'SELECT * FROM c WHERE c.status = @status',
        parameters: [{ name: '@status', value: 'published' }],
      })
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<Article | undefined> {
    const container = await this.getContainer();

    const { resources } = await container.items
      .query<Article>({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
      .fetchAll();
    return resources[0];
  }

  async findByIdAndCityId(id: string, cityId: string): Promise<Article | undefined> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<Article>({
        query: 'SELECT * FROM c WHERE c.id = @id AND c.cityId = @cityId',
        parameters: [
          { name: '@id', value: id },
          { name: '@cityId', value: cityId },
        ],
      })
      .fetchAll();
    return resources[0];
  }

  async create(
    input: CreateArticleInput & {
      id: string;
      cityId: string;
      authorId: string;
      createdAt: string;
      updatedAt: string;
    },
  ): Promise<Article> {
    const article: Article = {
      id: input.id,
      cityId: input.cityId,
      translations: [input.translation],
      coverImageUrl: input.coverImageUrl,
      status: input.status ?? 'draft',
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      authorId: input.authorId,
    };

    const container = await this.getContainer();
    await container.items.create(article);
    return article;
  }

  async update(id: string, input: Partial<Article>): Promise<Article | undefined> {
    const container = await this.getContainer();
    const existing = await this.findById(id);
    if (!existing) {
      return undefined;
    }
    const updated = { ...existing, ...input, id } as Article;
    await container.items.upsert(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const container = await this.getContainer();
    try {
      await container.item(id, id).delete();
      return true;
    } catch {
      return false;
    }
  }

  async addTranslation(id: string, translation: ArticleTranslation): Promise<Article | undefined> {
    const article = await this.findById(id);
    if (!article) {
      return undefined;
    }
    article.translations.push(translation);
    return this.update(id, article);
  }

  async updateTranslation(
    id: string,
    locale: ArticleLocale,
    translation: Partial<ArticleTranslation>,
  ): Promise<Article | undefined> {
    const article = await this.findById(id);
    if (!article) {
      return undefined;
    }
    const tIndex = article.translations.findIndex((t) => t.locale === locale);
    if (tIndex === -1) {
      return undefined;
    }
    article.translations[tIndex] = { ...article.translations[tIndex], ...translation } as ArticleTranslation;
    return this.update(id, article);
  }

  async deleteTranslation(id: string, locale: ArticleLocale): Promise<Article | undefined> {
    const article = await this.findById(id);
    if (!article) {
      return undefined;
    }
    article.translations = article.translations.filter((t) => t.locale !== locale);
    return this.update(id, article);
  }
}
