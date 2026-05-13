import type { CarouselItem, Category } from '@repo/contracts/config';

export interface IConfigRepository {
  getCarouselItems(): Promise<CarouselItem[]>;
  getCategories(): Promise<Category[]>;
  setCategories(categories: Category[]): Promise<Category[]>;
  setCarouselItems(items: CarouselItem[]): Promise<CarouselItem[]>;
}
