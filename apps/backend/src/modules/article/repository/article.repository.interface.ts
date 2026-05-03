import type { Article, ArticleLocale, ArticleTranslation, CreateArticleInput } from '@repo/contracts/article';

export interface IArticleRepository {
  findAll(): Promise<Article[]>;
  findAllPublished(): Promise<Article[]>;
  findById(id: string): Promise<Article | undefined>;
  create(
    input: CreateArticleInput & { id: string; authorId: string; createdAt: string; updatedAt: string },
  ): Promise<Article>;
  update(id: string, input: Partial<Article>): Promise<Article | undefined>;
  delete(id: string): Promise<boolean>;
  addTranslation(id: string, translation: ArticleTranslation): Promise<Article | undefined>;
  updateTranslation(
    id: string,
    locale: ArticleLocale,
    translation: Partial<ArticleTranslation>,
  ): Promise<Article | undefined>;
  deleteTranslation(id: string, locale: ArticleLocale): Promise<Article | undefined>;
}
