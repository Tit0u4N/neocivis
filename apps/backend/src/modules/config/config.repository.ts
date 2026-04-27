import type { CarouselItem, Category } from '@repo/contracts/config';
import { getMockCarouselItems, getMockCategories } from './config.mock';

export interface IConfigRepository {
  getCarouselItems(): Promise<CarouselItem[]>;
  getCategories(): Promise<Category[]>;
}

export class InMemoryConfigRepository implements IConfigRepository {
  private seeded = false;
  private carouselItems: CarouselItem[] = [];
  private categories: Category[] = [];

  private ensureSeeded(): void {
    if (this.seeded) {
      return;
    }
    this.carouselItems = getMockCarouselItems();
    this.categories = getMockCategories();
    this.seeded = true;
  }

  getCarouselItems(): Promise<CarouselItem[]> {
    this.ensureSeeded();
    return Promise.resolve(this.carouselItems);
  }

  getCategories(): Promise<Category[]> {
    this.ensureSeeded();
    return Promise.resolve(this.categories);
  }
}
