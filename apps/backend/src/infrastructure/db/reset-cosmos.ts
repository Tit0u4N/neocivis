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

const RETRY_DELAYS_MS = [3000, 5000, 10000, 15000, 20000];

async function ensureWithRetry(client: CosmosClient): Promise<void> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      await ensureCosmosDatabaseAndContainers(client);
      return;
    } catch (err: unknown) {
      const statusCode = getCosmosStatusCode(err);
      // 409 ContainerBeingDeleted: server-side deletion is async, wait and retry
      if (statusCode !== 409 || attempt === RETRY_DELAYS_MS.length) {
        throw err;
      }
      const delay = RETRY_DELAYS_MS[attempt] as number;
      // biome-ignore lint/suspicious/noConsole: script CLI
      console.info(`[db:reset:cosmos] containers still deleting, retrying in ${delay / 1000}s… (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
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

  await ensureWithRetry(client);
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
