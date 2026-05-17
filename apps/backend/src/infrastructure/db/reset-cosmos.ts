/**
 * Resets Cosmos DB dev data.
 * Destructive: requires explicit `--confirm`.
 */
import type { CosmosClient } from '@azure/cosmos';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import { optionalEnv } from '@/infrastructure/env';

function assertConfirm(): void {
  if (!process.argv.includes('--confirm')) {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.error(
      'Refusing to reset (destructive: deletes cosmos database). Re-run with --confirm, e.g. bun run db:reset -- --confirm',
    );
    process.exit(1);
  }
}

function getCosmosStatusCode(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') {
    return undefined;
  }
  if ('statusCode' in err && typeof (err as { statusCode?: unknown }).statusCode === 'number') {
    return (err as { statusCode: number }).statusCode;
  }
  if ('code' in err && typeof (err as { code?: unknown }).code === 'number') {
    return (err as { code: number }).code;
  }
  return undefined;
}

export async function resetCosmos(client: CosmosClient): Promise<void> {
  const databaseId = optionalEnv('COSMOS_DATABASE_ID') ?? 'neocivis';
  const containerId = 'articles';

  try {
    await client.database(databaseId).delete();
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info(`[db:reset:cosmos] cosmos database deleted (db=${databaseId})`);
  } catch (err: unknown) {
    const statusCode = getCosmosStatusCode(err);
    if (statusCode !== 404) {
      throw err;
    }
  }

  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ['/id'] },
  });
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(`[db:reset:cosmos] cosmos database ensured (db=${databaseId}, container=${containerId})`);
}

async function main(): Promise<void> {
  assertConfirm();
  await resetCosmos(getCosmosClient());
}

if (import.meta.main) {
  main().catch((err: unknown) => {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.error(err);
    process.exit(1);
  });
}
