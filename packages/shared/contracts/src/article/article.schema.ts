import { z } from 'zod';

export const ArticleStatus = z.enum(['draft', 'published']);
export type ArticleStatus = z.infer<typeof ArticleStatus>;

export const ArticleLocale = z.enum(['fr', 'en', 'de', 'it']);
export type ArticleLocale = z.infer<typeof ArticleLocale>;

export const ArticleTranslation = z.object({
  locale: ArticleLocale,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});
export type ArticleTranslation = z.infer<typeof ArticleTranslation>;

export const Article = z.object({
  id: z.string().uuid(),
  translations: z.array(ArticleTranslation).min(1),
  coverImageUrl: z.string().url().optional(),
  status: ArticleStatus,
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  authorId: z.string(),
});
export type Article = z.infer<typeof Article>;

export const CreateArticleInput = z.object({
  translation: ArticleTranslation,
  coverImageUrl: z.string().url().optional(),
  status: ArticleStatus.default('draft'),
});
export type CreateArticleInput = z.infer<typeof CreateArticleInput>;

export const UpdateArticleInput = CreateArticleInput.partial();
export type UpdateArticleInput = z.infer<typeof UpdateArticleInput>;

export const AddTranslationInput = z.object({
  locale: ArticleLocale,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});
export type AddTranslationInput = z.infer<typeof AddTranslationInput>;

export const UpdateStatusInput = z.object({
  status: ArticleStatus,
});
export type UpdateStatusInput = z.infer<typeof UpdateStatusInput>;
