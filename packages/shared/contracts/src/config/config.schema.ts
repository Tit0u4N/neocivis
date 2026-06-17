import { z } from 'zod';
import { ArticleLocale } from '../article/article.schema';

export { ArticleLocale as ConfigLocale };

export const SUPPORTED_LOCALES = ['fr', 'en', 'de', 'it'] as const;

export const CategoryLink = z.object({
  type: z.string(),
  value: z.string().optional(),
});
export type CategoryLink = z.infer<typeof CategoryLink>;

export const CategoryTranslation = z.object({
  locale: ArticleLocale,
  name: z.string().min(1).max(100),
});
export type CategoryTranslation = z.infer<typeof CategoryTranslation>;

export const Category = z.object({
  id: z.string(),
  link: CategoryLink.optional(),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  row: z.number().int().nonnegative().optional(),
  col: z.number().int().nonnegative().optional(),
  colSpan: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  rowSpan: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  translations: z.array(CategoryTranslation).min(1),
});
export type Category = z.infer<typeof Category>;

export const CategoryResolved = Category.omit({ translations: true }).extend({
  name: z.string(),
});
export type CategoryResolved = z.infer<typeof CategoryResolved>;

export const CarouselItemTranslation = z.object({
  locale: ArticleLocale,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  tag: z.string().optional(),
});
export type CarouselItemTranslation = z.infer<typeof CarouselItemTranslation>;

export const CarouselItem = z.object({
  id: z.string(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().optional(),
  order: z.number().int().nonnegative(),
  translations: z.array(CarouselItemTranslation).min(1),
});
export type CarouselItem = z.infer<typeof CarouselItem>;

export const CarouselItemResolved = CarouselItem.omit({ translations: true }).extend({
  title: z.string(),
  description: z.string().optional(),
  tag: z.string().optional(),
});
export type CarouselItemResolved = z.infer<typeof CarouselItemResolved>;

export const ConfigQuery = z.object({
  locale: ArticleLocale.optional().default('fr'),
});
export type ConfigQuery = z.infer<typeof ConfigQuery>;

export const CitizenConfigResponse = z.object({
  carousel: z.array(CarouselItemResolved),
  categories: z.array(CategoryResolved),
});
export type CitizenConfigResponse = z.infer<typeof CitizenConfigResponse>;

export const SetCategoriesInput = z.array(Category);
export type SetCategoriesInput = z.infer<typeof SetCategoriesInput>;

export const SetCarouselItemsInput = z.array(CarouselItem);
export type SetCarouselItemsInput = z.infer<typeof SetCarouselItemsInput>;

export const MunicipalityConfigResponse = z.object({
  categories: z.array(Category),
  carousel: z.array(CarouselItem),
});
export type MunicipalityConfigResponse = z.infer<typeof MunicipalityConfigResponse>;
