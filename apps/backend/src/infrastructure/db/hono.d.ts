import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@/schemas/db';

declare module 'hono' {
  interface Variables {
    db?: PostgresJsDatabase<typeof schema>;
  }
}
