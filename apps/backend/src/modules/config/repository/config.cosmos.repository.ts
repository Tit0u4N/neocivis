import type { Container } from '@azure/cosmos';
import type { CarouselItem, Category } from '@repo/contracts/config';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { getCosmosContainer } from '@/infrastructure/azure/cosmos.setup';
import { optionalEnv } from '@/infrastructure/env';
import type { IConfigRepository } from './config.repository.interface';

export function isCosmosConfigured(): boolean {
  return Boolean(optionalEnv('COSMOS_ENDPOINT') && optionalEnv('COSMOS_KEY'));
}

type CityConfigDocument = {
  id: string; // cityId (partition key is /id)
  cityId: string;
  categories: Category[];
  carousel: CarouselItem[];
};

function emptyDoc(cityId: string): CityConfigDocument {
  return {
    id: cityId,
    cityId,
    categories: [],
    carousel: [],
  };
}

export class CosmosConfigRepository implements IConfigRepository {
  private cosmosContainer: Container | null = null;

  private async getContainer(): Promise<Container> {
    if (this.cosmosContainer) {
      return this.cosmosContainer;
    }
    const client = getCosmosClient();
    const container = await getCosmosContainer(client, 'config');
    this.cosmosContainer = container;
    return container;
  }

  private async getOrCreateDoc(cityId: string): Promise<CityConfigDocument> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<CityConfigDocument>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: cityId }],
      })
      .fetchAll();
    const doc = resources[0];
    if (doc) {
      return doc;
    }
    const created = emptyDoc(cityId);
    await container.items.create(created);
    return created;
  }

  async getCarouselItems(cityId: string): Promise<CarouselItem[]> {
    const doc = await this.getOrCreateDoc(cityId);
    return doc.carousel;
  }

  async getCategories(cityId: string): Promise<Category[]> {
    const doc = await this.getOrCreateDoc(cityId);
    return doc.categories;
  }

  async setCategories(cityId: string, categories: Category[]): Promise<Category[]> {
    const existing = await this.getOrCreateDoc(cityId);
    const updated: CityConfigDocument = { ...existing, id: cityId, cityId, categories };
    const container = await this.getContainer();
    await container.items.upsert(updated);
    return updated.categories;
  }

  async setCarouselItems(cityId: string, items: CarouselItem[]): Promise<CarouselItem[]> {
    const existing = await this.getOrCreateDoc(cityId);
    const updated: CityConfigDocument = { ...existing, id: cityId, cityId, carousel: items };
    const container = await this.getContainer();
    await container.items.upsert(updated);
    return updated.carousel;
  }
}

