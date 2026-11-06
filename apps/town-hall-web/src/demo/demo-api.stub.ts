/**
 * Stub par défaut de `@demo-api`.
 * En mode démo, `next.config.ts` remplace cet alias par le bundle `apps/backend/dist-demo/demo-api.js`
 * (généré par `bun run build:demo` dans `apps/backend`). Hors démo, rien du backend n'est embarqué.
 */
export type DemoUser = Readonly<{
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}>;

export type DemoFetchOptions = {
  user: DemoUser;
  latencyMs?: number;
};

export function getDemoUser(_username: string): DemoUser {
  throw new Error('[demo] @demo-api is not available outside demo mode');
}

export function createDemoFetch(_options: DemoFetchOptions): typeof fetch {
  throw new Error('[demo] @demo-api is not available outside demo mode');
}
