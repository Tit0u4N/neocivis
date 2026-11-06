import { createDemoFetch, getDemoUser } from '@demo-api';
import { DEMO_USERNAME } from './demo-mode';

/** `fetch` servant l'API depuis le backend en mémoire (mode démo uniquement). */
export function createCitizenDemoFetch(): typeof fetch {
  return createDemoFetch({ user: getDemoUser(DEMO_USERNAME) });
}
