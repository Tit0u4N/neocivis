import type { Container } from '@azure/cosmos';
import type { Report } from '@repo/contracts/report';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { ensureCosmosDatabaseAndContainers } from '@/infrastructure/azure/cosmos.setup';
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
    // Use ensureCosmosDatabaseAndContainers so the database is always created
    // with shared throughput before adding the reports container.
    // Creating the database without throughput here would result in a
    // per-container database, causing every container to get 400 RU/s dedicated
    // and exceeding the account's 1000 RU/s total limit.
    const database = await ensureCosmosDatabaseAndContainers(client);
    const { container } = await database.containers.createIfNotExists({
      id: 'reports',
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
        query: 'SELECT COUNT(1) AS count FROM c WHERE c.authorId = @authorId',
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
        query: 'SELECT COUNT(1) AS count FROM c WHERE c.cityId = @cityId',
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

  async deleteAll(): Promise<void> {
    const container = await this.getContainer();
    const { resources } = await container.items
      .query<{ id: string; authorId: string }>({ query: 'SELECT c.id, c.authorId FROM c' })
      .fetchAll();
    for (const item of resources) {
      await container.item(item.id, item.authorId).delete();
    }
  }
}
