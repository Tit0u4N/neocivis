import type { Container } from '@azure/cosmos';
import type { Report } from '@repo/contracts/report';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { optionalEnv } from '@/infrastructure/env';
import type { IReportRepository } from './repository/report.repository.interface';

export function isReportCosmosConfigured(): boolean {
  return Boolean(optionalEnv('COSMOS_ENDPOINT') && optionalEnv('COSMOS_KEY'));
}

export class CosmosReportRepository implements IReportRepository {
  private cosmosContainer: Container | null = null;

  private async getContainer(): Promise<Container> {
    if (this.cosmosContainer) {
      return this.cosmosContainer;
    }

    const client = getCosmosClient();
    const databaseId = optionalEnv('COSMOS_DATABASE_ID') ?? 'neocivis';
    const containerId = 'reports';

    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ['/authorId'] },
    });

    this.cosmosContainer = container;
    return container;
  }

  async findByAuthor(authorId: string, page: number, limit: number): Promise<{ items: Report[]; total: number }> {
    const container = await this.getContainer();

    // Get total count
    const { resources: countRes } = await container.items
      .query<{ count: number }>({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.authorId = @authorId',
        parameters: [{ name: '@authorId', value: authorId }],
      })
      .fetchAll();
    const total = countRes[0]?.count ?? 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const { resources } = await container.items
      .query<Report>({
        query: 'SELECT * FROM c WHERE c.authorId = @authorId ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit',
        parameters: [
          { name: '@authorId', value: authorId },
          { name: '@offset', value: offset },
          { name: '@limit', value: limit },
        ],
      })
      .fetchAll();

    return { items: resources, total };
  }

  async findById(id: string): Promise<Report | null> {
    const container = await this.getContainer();

    const { resources } = await container.items
      .query<Report>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return resources[0] ?? null;
  }

  async create(report: Report): Promise<Report> {
    const container = await this.getContainer();
    await container.items.create(report);
    return report;
  }

  async findByCityId(cityId: string, page: number, limit: number): Promise<{ items: Report[]; total: number }> {
    const container = await this.getContainer();

    const { resources: countRes } = await container.items
      .query<{ count: number }>({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.cityId = @cityId',
        parameters: [{ name: '@cityId', value: cityId }],
      })
      .fetchAll();
    const total = countRes[0]?.count ?? 0;

    const offset = (page - 1) * limit;
    const { resources } = await container.items
      .query<Report>({
        query: 'SELECT * FROM c WHERE c.cityId = @cityId ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit',
        parameters: [
          { name: '@cityId', value: cityId },
          { name: '@offset', value: offset },
          { name: '@limit', value: limit },
        ],
      })
      .fetchAll();

    return { items: resources, total };
  }

  async update(id: string, patch: Partial<Report>): Promise<Report> {
    const container = await this.getContainer();
    const existing = await this.findById(id);

    if (!existing) {
      throw new Error(`Report not found: ${id}`);
    }

    const updated = { ...existing, ...patch, id } as Report;
    await container.items.upsert(updated);
    return updated;
  }
}
