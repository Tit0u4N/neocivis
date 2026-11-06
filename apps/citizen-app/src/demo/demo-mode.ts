/**
 * Mode démo statique (ex: GitHub Pages) : pas de Keycloak ni d'API,
 * le backend tourne en mémoire dans le navigateur avec les données de seed.
 * Activé au build par `EXPO_PUBLIC_DEMO_MODE=true`.
 */
export const IS_DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

/** Utilisateur de seed incarné en démo (voir `apps/backend/src/modules/users/seed/user.seed.ts`). */
export const DEMO_USERNAME = process.env.EXPO_PUBLIC_DEMO_USER ?? 'citizen1';

/** Origine fictive : les requêtes sont interceptées par le `fetch` démo, jamais envoyées sur le réseau. */
export const DEMO_API_BASE_URL = 'https://demo.neocivis.invalid/api/citizen';
