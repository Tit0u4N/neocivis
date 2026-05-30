// biome-ignore-all lint/suspicious/useAwait: mock file

import type { CarouselItem, Category } from '@repo/contracts/config';
import { getMockCategories } from '../seed/config.seed';
import type { IConfigRepository } from './config.repository.interface';

export class InMemoryConfigRepository implements IConfigRepository {
  private seededCityIds = new Set<string>();
  private carouselItemsByCityId = new Map<string, CarouselItem[]>();
  private categoriesByCityId = new Map<string, Category[]>();

  private ensureSeeded(cityId: string): void {
    if (this.seededCityIds.has(cityId)) {
      return;
    }
    this.carouselItemsByCityId.set(cityId, []);
    this.categoriesByCityId.set(cityId, getMockCategories());
    this.seededCityIds.add(cityId);
  }

  async getCarouselItems(cityId: string): Promise<CarouselItem[]> {
    this.ensureSeeded(cityId);
    return this.carouselItemsByCityId.get(cityId) ?? [];
  }

  async getCategories(cityId: string): Promise<Category[]> {
    this.ensureSeeded(cityId);
    return this.categoriesByCityId.get(cityId) ?? [];
  }

  async setCategories(cityId: string, categories: Category[]): Promise<Category[]> {
    this.ensureSeeded(cityId);
    this.categoriesByCityId.set(cityId, categories);
    return this.categoriesByCityId.get(cityId) ?? [];
  }

  async setCarouselItems(cityId: string, items: CarouselItem[]): Promise<CarouselItem[]> {
    this.ensureSeeded(cityId);
    this.carouselItemsByCityId.set(cityId, items);
    return this.carouselItemsByCityId.get(cityId) ?? [];
  }
}
