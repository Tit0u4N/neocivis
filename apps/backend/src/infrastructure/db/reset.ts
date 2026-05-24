/**
 * Orchestrator for DB resets.
 *
 * Choices:
 * - Postgres/Drizzle only
 * - Cosmos only (+ Azure Blob media when configured)
 * - Both (+ blob with Cosmos)
 * - Blob only (`--blob`)
 *
 * Destructive: requires explicit `--confirm`.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import dotenv from 'dotenv';
import { optionalEnv } from '@/infrastructure/env';
import { isBlobStorageConfigured, resetBlobStorage } from './reset-blob';
import { resetCosmos } from './reset-cosmos';
import { resetDrizzle } from './reset-drizzle';

function loadEnvFromBackendRoot(): void {
  const root = process.cwd();
  for (const name of ['.env.local', '.env']) {
    const path = resolve(root, name);
    if (existsSync(path)) {
      dotenv.config({ path });
      return;
    }
  }
}

function assertConfirm(): void {
  if (!process.argv.includes('--confirm')) {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.error(
      'Refusing to reset (destructive: drops public schema). Re-run with --confirm, e.g. bun run db:reset -- --confirm',
    );
    process.exit(1);
  }
}

function isCosmosConfigured(): boolean {
  return Boolean(optionalEnv('COSMOS_ENDPOINT') && optionalEnv('COSMOS_KEY'));
}

type ResetTarget = 'DRIZZLE' | 'COSMOS' | 'BLOB' | 'BOTH';

function parseTargetFromArgs(): ResetTarget | null {
  const argv = process.argv;
  const wantsDrizzle = argv.includes('--drizzle') || argv.includes('--postgres') || argv.includes('--postgress');
  const wantsCosmos = argv.includes('--cosmos');
  const wantsBlob = argv.includes('--blob') || argv.includes('--storage');
  const wantsAll = argv.includes('--all') || argv.includes('--both');

  if (wantsAll || (wantsDrizzle && wantsCosmos)) {
    return 'BOTH';
  }
  if (wantsBlob && !wantsDrizzle && !wantsCosmos) {
    return 'BLOB';
  }
  if (wantsDrizzle) {
    return 'DRIZZLE';
  }
  if (wantsCosmos) {
    return 'COSMOS';
  }
  return null;
}

async function promptTarget(): Promise<ResetTarget> {
  if (!process.stdin.isTTY) {
    return 'BOTH';
  }

  const rl = createInterface({ input, output });
  try {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('\nQue veux-tu reset ?');
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('  1) Postgres (Drizzle)');
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('  2) Cosmos DB (+ Azure Blob media si configuré)');
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('  3) Azure Blob media uniquement');
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('  4) Les deux (Postgres + Cosmos + Blob)');

    const answer = (await rl.question('Choix (1/2/3/4) [4]: ')).trim();
    if (answer === '' || answer === '4') {
      return 'BOTH';
    }
    if (answer === '1') {
      return 'DRIZZLE';
    }
    if (answer === '2') {
      return 'COSMOS';
    }
    if (answer === '3') {
      return 'BLOB';
    }
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.warn('Choix invalide, on fait Postgres + Cosmos + Blob par défaut.');
    return 'BOTH';
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  loadEnvFromBackendRoot();
  assertConfirm();

  const target = parseTargetFromArgs() ?? (await promptTarget());

  if (target === 'DRIZZLE' || target === 'BOTH') {
    await resetDrizzle();
  }

  if (target === 'COSMOS' || target === 'BOTH') {
    if (isCosmosConfigured()) {
      const { getCosmosClient } = await import('@/infrastructure/azure/cosmos.client');
      await resetCosmos(getCosmosClient());
    } else {
      // biome-ignore lint/suspicious/noConsole: script CLI
      console.info('[db:reset] cosmos not configured; skipping');
    }
  }

  if (target === 'BLOB' || target === 'COSMOS' || target === 'BOTH') {
    if (isBlobStorageConfigured()) {
      await resetBlobStorage();
    } else {
      // biome-ignore lint/suspicious/noConsole: script CLI
      console.info('[db:reset] azure blob storage not configured; skipping');
    }
  }
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error(err);
  process.exit(1);
});
