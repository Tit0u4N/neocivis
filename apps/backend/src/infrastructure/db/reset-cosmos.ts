/**
 * Resets Cosmos DB dev data.
 * Destructive: requires explicit `--confirm`.
 */
import type { CosmosClient } from '@azure/cosmos';
import { getCosmosClient } from '@/infrastructure/azure/cosmos.client';
import {
  COSMOS_CONTAINER_IDS,
  ensureCosmosDatabaseAndContainers,
  getCosmosDatabaseId,
} from '@/infrastructure/azure/cosmos.setup';

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
  const databaseId = getCosmosDatabaseId();

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

  await ensureCosmosDatabaseAndContainers(client);
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(
    `[db:reset:cosmos] cosmos database ensured (db=${databaseId}, containers=${COSMOS_CONTAINER_IDS.join(', ')})`,
  );
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
