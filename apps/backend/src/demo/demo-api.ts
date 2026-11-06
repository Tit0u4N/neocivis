/**
 * Point d'entrée « démo » : le backend Hono complet (mode IN_MEMORY + seeds) exécuté dans le navigateur.
 *
 * Compilé à part via `tsup.demo.config.ts` (deps Node/Azure/DB remplacées par des stubs),
 * puis consommé par les frontends en mode démo via l'option `fetch` de ky :
 * aucune requête réseau n'est émise vers une API, tout est servi en mémoire.
 */
import { runSeeders } from '@/core/auto-seed';
import {
  createAccessRepository,
  createArticleRepository,
  createCityRepository,
  createConfigRepository,
  createEstablishmentRepository,
  createMediaRepository,
  createReportRepository,
  createThreadRepository,
  createUserRepository,
} from '@/core/in-memory-repositories';
import citizenGateway from '@/gateways/citizen/citizen.gateway';
import municipalityGateway from '@/gateways/municipality/municipality.gateway';
import { AccessService } from '@/modules/access/access.service';
import { CityService } from '@/modules/city/city.service';
import { PicsumMediaBlobService } from '@/modules/media/media-blob.service';
import { loadSeededUsersFromRealmConfigDev } from '@/modules/users/seed/user.seed';
import { UserService } from '@/modules/users/service/user.service';
import { DemoIAMService, demoKeycloakId } from './demo-iam.service';

export type DemoUser = Readonly<{
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}>;

/** Utilisateurs disponibles en démo (issus de `user.seed.ts`). */
export function listDemoUsers(): DemoUser[] {
  return loadSeededUsersFromRealmConfigDev().map((u) => ({
    keycloakId: demoKeycloakId(u.username),
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    roles: u.realmRoles,
  }));
}

export function getDemoUser(username: string): DemoUser {
  const user = listDemoUsers().find((u) => u.username === username);
  if (!user) {
    throw new Error(`[demo] Unknown demo user "${username}"`);
  }
  return user;
}

let seedPromise: Promise<void> | null = null;

function ensureSeeded(): Promise<void> {
  seedPromise ??= (async () => {
    const userRepository = createUserRepository();
    const cityRepository = createCityRepository();
    const mediaBlobService = new PicsumMediaBlobService();
    const iamService = new DemoIAMService();
    const userService = new UserService(userRepository, iamService, mediaBlobService);
    const cityService = new CityService(cityRepository, userService, iamService);
    const accessService = new AccessService(createAccessRepository(), cityService, userService);

    await runSeeders(
      {
        userService,
        articleRepository: createArticleRepository(),
        cityRepository,
        iamService,
        accessService,
        establishmentRepository: createEstablishmentRepository(),
        threadRepository: createThreadRepository(),
        reportRepository: createReportRepository(),
        mediaRepository: createMediaRepository(),
        mediaBlobService,
        configRepository: createConfigRepository(),
      },
      'RESET_DATA',
    );
  })();
  return seedPromise;
}

export type DemoFetchOptions = {
  /** Utilisateur au nom duquel les requêtes sont faites (headers `X-User-*` normalement posés par APIM). */
  user: DemoUser;
  /** Latence artificielle (ms) pour rendre les états de chargement visibles. */
  latencyMs?: number;
};

/**
 * Crée une fonction compatible `fetch` qui route `/api/municipality/*` et `/api/citizen/*`
 * vers les gateways Hono en mémoire. Toute autre URL part sur le vrai réseau.
 */
export function createDemoFetch({ user, latencyMs = 150 }: DemoFetchOptions): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const { pathname } = new URL(request.url);

    const gateway = pathname.startsWith('/api/municipality')
      ? municipalityGateway
      : pathname.startsWith('/api/citizen')
        ? citizenGateway
        : null;
    if (!gateway) {
      return await fetch(request);
    }

    await ensureSeeded();
    if (latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
    }

    const headers = new Headers(request.headers);
    headers.delete('Authorization');
    headers.set('X-User-Id', user.keycloakId);
    headers.set('X-User-Roles', user.roles.join(','));
    headers.set('X-User-Username', user.username);
    headers.set('X-User-Email', user.email);
    headers.set('X-User-First-Name', user.firstName);
    headers.set('X-User-Last-Name', user.lastName);

    return await gateway.fetch(new Request(request, { headers }));
  };
}
