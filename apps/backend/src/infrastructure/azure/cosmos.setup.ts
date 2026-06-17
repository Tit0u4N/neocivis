import type { Container, CosmosClient, Database } from '@azure/cosmos';
import { optionalEnv } from '@/infrastructure/env';

/** Containers sharing database-level throughput (no per-container RU/s). */
export const COSMOS_CONTAINER_IDS = ['articles', 'media', 'config'] as const;

export type CosmosContainerId = (typeof COSMOS_CONTAINER_IDS)[number];

const MIN_DATABASE_THROUGHPUT = 400;
const MAX_DATABASE_THROUGHPUT = 1000;

export function getCosmosDatabaseId(): string {
  return optionalEnv('COSMOS_DATABASE_ID') ?? 'neocivis';
}

/**
 * Shared database throughput (RU/s). All containers use this pool — avoids
 * 400 RU/s per container (e.g. articles + media = 800+ on a 1000 RU/s account).
 */
export function getCosmosDatabaseThroughput(): number {
  const raw = optionalEnv('COSMOS_DATABASE_THROUGHPUT');
  if (!raw) {
    return MIN_DATABASE_THROUGHPUT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return MIN_DATABASE_THROUGHPUT;
  }
  return Math.min(MAX_DATABASE_THROUGHPUT, Math.max(MIN_DATABASE_THROUGHPUT, parsed));
}

/**
 * Ensures the database exists with shared throughput, then all app containers
 * without dedicated throughput.
 */
export async function ensureCosmosDatabaseAndContainers(client: CosmosClient): Promise<Database> {
  const databaseId = getCosmosDatabaseId();
  const throughput = getCosmosDatabaseThroughput();

  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
    throughput,
  });

  for (const containerId of COSMOS_CONTAINER_IDS) {
    await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ['/id'] },
    });
  }

  return database;
}

export async function getCosmosContainer(client: CosmosClient, containerId: CosmosContainerId): Promise<Container> {
  const database = await ensureCosmosDatabaseAndContainers(client);
  return database.container(containerId);
}
