// biome-ignore-all lint/suspicious/useAwait: mock file

import type { CarouselItem, Category } from '@repo/contracts/config';
import { getMockCarouselItems, getMockCategories } from '../seed/config.seed';
import type { IConfigRepository } from './config.repository.interface';

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

  async getCarouselItems(): Promise<CarouselItem[]> {
    this.ensureSeeded();
    return this.carouselItems;
  }

  async getCategories(): Promise<Category[]> {
    this.ensureSeeded();
    return this.categories;
  }

  async setCategories(categories: Category[]): Promise<Category[]> {
    this.ensureSeeded();
    this.categories = categories;
    return this.categories;
  }

  async setCarouselItems(items: CarouselItem[]): Promise<CarouselItem[]> {
    this.ensureSeeded();
    this.carouselItems = items;
    return this.carouselItems;
  }
}
