import type { Container } from '@azure/cosmos';
import type { MediaImage } from '@repo/contracts/media';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { getCosmosContainer } from '@/infrastructure/azure/cosmos.setup';
import { optionalEnv } from '@/infrastructure/env';
import type { IMediaRepository } from './media.repository.interface';

export function isCosmosConfigured(): boolean {
  return Boolean(optionalEnv('COSMOS_ENDPOINT') && optionalEnv('COSMOS_KEY'));
}

export class CosmosMediaRepository implements IMediaRepository {
  private cosmosContainer: Container | null = null;

  private async getContainer(): Promise<Container> {
    if (this.cosmosContainer) {
      return this.cosmosContainer;
    }

    const client = getCosmosClient();
    const container = await getCosmosContainer(client, 'media');

    this.cosmosContainer = container;
    return container;
  }

  async findAll(): Promise<MediaImage[]> {
    const container = await this.getContainer();
    const { resources } = await container.items.query<MediaImage>('SELECT * FROM c').fetchAll();
    return resources;
  }

  async findByCityId(cityId: string): Promise<MediaImage[]> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<MediaImage>({
        query: 'SELECT * FROM c WHERE c.cityId = @cityId',
        parameters: [{ name: '@cityId', value: cityId }],
      })
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<MediaImage | undefined> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<MediaImage>({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
      .fetchAll();
    return resources[0];
  }

  async findByIdAndCityId(id: string, cityId: string): Promise<MediaImage | undefined> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<MediaImage>({
        query: 'SELECT * FROM c WHERE c.id = @id AND c.cityId = @cityId',
        parameters: [
          { name: '@id', value: id },
          { name: '@cityId', value: cityId },
        ],
      })
      .fetchAll();
    return resources[0];
  }

  async create(media: MediaImage): Promise<MediaImage> {
    const container = await this.getContainer();
    await container.items.create(media);
    return media;
  }

  async update(id: string, input: Partial<MediaImage>): Promise<MediaImage | undefined> {
    const existing = await this.findById(id);
    if (!existing) {
      return undefined;
    }
    const updated = { ...existing, ...input, id } as MediaImage;
    const container = await this.getContainer();
    await container.items.upsert(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const container = await this.getContainer();
    try {
      await container.item(id, id).delete();
      return true;
    } catch {
      return false;
    }
  }
}
