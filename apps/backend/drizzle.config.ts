import { defineConfig } from 'drizzle-kit';

/** Connexion used by drizzle-kit (generate / studio / push). */
const databaseUrl =  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  schema: './src/schemas/db/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
