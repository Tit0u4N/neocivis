/**
 * Orchestrator for DB resets.
 *
 * Choices:
 * - Postgres/Drizzle only
 * - Cosmos only
 * - Both
 *
 * Destructive: requires explicit `--confirm`.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import dotenv from 'dotenv';
import { optionalEnv } from '@/infrastructure/env';
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

type ResetTarget = 'DRIZZLE' | 'COSMOS' | 'BOTH';

function parseTargetFromArgs(): ResetTarget | null {
  const argv = process.argv;
  const wantsDrizzle = argv.includes('--drizzle') || argv.includes('--postgres') || argv.includes('--postgress');
  const wantsCosmos = argv.includes('--cosmos');
  const wantsAll = argv.includes('--all') || argv.includes('--both');

  if (wantsAll || (wantsDrizzle && wantsCosmos)) {
    return 'BOTH';
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
    console.info('  2) Cosmos DB');
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('  3) Les deux');

    const answer = (await rl.question('Choix (1/2/3) [3]: ')).trim();
    if (answer === '' || answer === '3') {
      return 'BOTH';
    }
    if (answer === '1') {
      return 'DRIZZLE';
    }
    if (answer === '2') {
      return 'COSMOS';
    }
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.warn('Choix invalide, on fait "les deux" par défaut.');
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
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error(err);
  process.exit(1);
});
