import type { Container } from '@azure/cosmos';
import type { Article, ArticleLocale, ArticleTranslation, CreateArticleInput } from '@repo/contracts/article';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { optionalEnv } from '@/infrastructure/env';
import { getMockArticles } from './article.mockdata.repository';

export class ArticleRepository {
  private cosmosContainer: Container | null = null;
  private seedPromise: Promise<void> | null = null;

  private async getContainer(): Promise<Container> {
    if (this.cosmosContainer) {
      return this.cosmosContainer;
    }

    const client = getCosmosClient();
    const databaseId = optionalEnv('COSMOS_DATABASE_ID') ?? 'neocivis';
    const containerId = 'articles';

    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ['/id'] },
    });

    this.cosmosContainer = container;
    return container;
  }

  private ensureSeeded(): Promise<void> {
    if (this.seedPromise) {
      return this.seedPromise;
    }

    this.seedPromise = (async () => {
      const container = await this.getContainer();
      const { resources } = await container.items.query<{ id: string }>('SELECT TOP 1 c.id FROM c').fetchAll();
      if (resources.length > 0) {
        return;
      }

      const mock = getMockArticles();
      await Promise.all(mock.map((a) => container.items.upsert(a)));
    })().finally(() => {
      this.seedPromise = null;
    });

    return this.seedPromise;
  }

  async findAll(): Promise<Article[]> {
    await this.ensureSeeded();
    const container = await this.getContainer();
    const { resources } = await container.items.query<Article>('SELECT * FROM c').fetchAll();
    return resources;
  }

  async findAllPublished(): Promise<Article[]> {
    await this.ensureSeeded();
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<Article>({ query: 'SELECT * FROM c WHERE c.status = @status', parameters: [{ name: '@status', value: 'published' }] })
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<Article | undefined> {
    await this.ensureSeeded();
    const container = await this.getContainer();

    const { resources } = await container.items
      .query<Article>({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
      .fetchAll();
    return resources[0];
  }

  async create(
    input: CreateArticleInput & { id: string; authorId: string; createdAt: string; updatedAt: string },
  ): Promise<Article> {
    await this.ensureSeeded();
    const article: Article = {
      id: input.id,
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
    await this.ensureSeeded();
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
    await this.ensureSeeded();
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
