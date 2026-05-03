/**
 * Drizzle applies SQL migrations forward only (no generated "down" scripts).
 * This script wipes the `public` schema (dev-style reset), then reapplies migrations.
 * Destructive: requires explicit `--confirm`.
 */
import { join } from 'node:path';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { requiredEnv } from '@/infrastructure/env';

const migrationsFolder = join(process.cwd(), 'drizzle');

function assertConfirm(): void {
  if (!process.argv.includes('--confirm')) {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.error(
      'Refusing to reset (destructive: drops public schema). Re-run with --confirm, e.g. bun run db:reset -- --confirm',
    );
    process.exit(1);
  }
}

export async function resetDrizzle(): Promise<void> {
  const url = requiredEnv('DATABASE_URL');
  const sql = postgres(url, { max: 1 });

  try {
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE');
    await sql.unsafe('CREATE SCHEMA public');
    await sql.unsafe('GRANT ALL ON SCHEMA public TO PUBLIC');
    await sql.unsafe('DROP SCHEMA IF EXISTS drizzle CASCADE');
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('[db:reset:drizzle] schemas dropped');

    const db = drizzle(sql);
    await migrate(db, { migrationsFolder });
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info(`[db:reset:drizzle] public schema recreated and migrations applied from ${migrationsFolder}`);
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  assertConfirm();
  await resetDrizzle();
}

if (import.meta.main) {
  main().catch((err: unknown) => {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.error(err);
    process.exit(1);
  });
}
