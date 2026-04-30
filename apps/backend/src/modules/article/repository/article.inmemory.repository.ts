import type { Article, ArticleLocale, ArticleTranslation, CreateArticleInput } from '@repo/contracts/article';
import type { IArticleRepository } from './article.repository.interface';

export class InMemoryArticleRepository implements IArticleRepository {
  private articles: Article[] = [];

  findAll(): Promise<Article[]> {
    return Promise.resolve(this.articles);
  }

  findAllPublished(): Promise<Article[]> {
    return Promise.resolve(this.articles.filter((a) => a.status === 'published'));
  }

  findById(id: string): Promise<Article | undefined> {
    return Promise.resolve(this.articles.find((a) => a.id === id));
  }

  create(
    input: CreateArticleInput & { id: string; authorId: string; createdAt: string; updatedAt: string },
  ): Promise<Article> {
    const article: Article = {
      id: input.id,
      translations: [input.translation],
      coverImageUrl: input.coverImageUrl,
      status: input.status ?? 'draft',
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      authorId: input.authorId,
    };
    this.articles.push(article);
    return Promise.resolve(article);
  }

  update(id: string, input: Partial<Article>): Promise<Article | undefined> {
    const index = this.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const updated = { ...this.articles[index], ...input, id } as Article;
    this.articles[index] = updated;
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<boolean> {
    const index = this.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    this.articles.splice(index, 1);
    return Promise.resolve(true);
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
