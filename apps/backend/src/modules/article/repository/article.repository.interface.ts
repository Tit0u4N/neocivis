import type { Article, ArticleLocale, ArticleTranslation, CreateArticleInput } from '@repo/contracts/article';

export interface IArticleRepository {
  findAll(): Promise<Article[]>;
  findAllByCityId(cityId: string): Promise<Article[]>;
  findAllPublished(): Promise<Article[]>;
  findById(id: string): Promise<Article | undefined>;
  findByIdAndCityId(id: string, cityId: string): Promise<Article | undefined>;
  create(
    input: CreateArticleInput & {
      id: string;
      cityId: string;
      authorId: string;
      createdAt: string;
      updatedAt: string;
    },
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
