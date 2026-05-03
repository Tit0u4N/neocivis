import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { requiredEnv } from '@/infrastructure/env';

const migrationsFolder = join(process.cwd(), 'drizzle');

async function main() {
  const url = requiredEnv('DATABASE_URL');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder });
  await sql.end();
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(`Migration applied from ${migrationsFolder}`);
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error(err);
  process.exit(1);
});
