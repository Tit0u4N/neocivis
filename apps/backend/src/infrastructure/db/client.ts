import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requiredEnv } from '@/infrastructure/env';
import * as schema from '@/schemas/db';

export type AppDatabase = PostgresJsDatabase<typeof schema>;

let db: AppDatabase | undefined;
let sql: ReturnType<typeof postgres> | undefined;

/**
 * Client Drizzle (postgres.js), singleton par worker Azure Functions.
 * Nécessite `DATABASE_URL` (voir `local-example.settings.json`).
 */
export function getDb(): AppDatabase {
  if (!db) {
    const url = requiredEnv('DATABASE_URL');
    const max = Number(process.env.DATABASE_POOL_MAX ?? '5');
    // postgres.js utilise des clés snake_case pour les options réseau.
    const options = {
      max,
      // biome-ignore lint/style/useNamingConvention: option postgres.js
      idle_timeout: 20,
      // biome-ignore lint/style/useNamingConvention: option postgres.js
      connect_timeout: 10,
    };
    sql = postgres(url, options);
    db = drizzle(sql, { schema });
  }
  return db;
}
