import type { CarouselItem, Category } from '@repo/contracts/config';

export interface IConfigRepository {
  getCarouselItems(cityId: string): Promise<CarouselItem[]>;
  getCategories(cityId: string): Promise<Category[]>;
  setCategories(cityId: string, categories: Category[]): Promise<Category[]>;
  setCarouselItems(cityId: string, items: CarouselItem[]): Promise<CarouselItem[]>;
}
