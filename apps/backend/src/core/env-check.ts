import { optionalEnv, requiredEnv } from '@/infrastructure/env';
import { isInMemoryMode } from './runtime-config';

export function assertBackendEnv(): void {
  if (isInMemoryMode()) {
    return;
  }

  // DB is required when we run with Drizzle repositories.
  requiredEnv('DATABASE_URL');

  // Cosmos is required when not in-memory (article repository uses Cosmos).
  requiredEnv('COSMOS_ENDPOINT');
  requiredEnv('COSMOS_KEY');

  // Optional: still read, so a typo is visible early in logs (but doesn't block).
  optionalEnv('KEYCLOAK_BASE_URL');
  optionalEnv('KEYCLOAK_REALM');
  optionalEnv('KEYCLOAK_CLIENT_ID');
  optionalEnv('KEYCLOAK_CLIENT_SECRET');
}

