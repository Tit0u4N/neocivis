import type { IAMService, IamUser, IamUserProfile } from '@/modules/iam/iam.service';
import { loadSeededUsersFromRealmConfigDev } from '@/modules/users/seed/user.seed';

/** Préfixe des faux identifiants Keycloak utilisés en mode démo (ex: `demo-admin-nice`). */
export const DEMO_KEYCLOAK_ID_PREFIX = 'demo-';

export function demoKeycloakId(username: string): string {
  return `${DEMO_KEYCLOAK_ID_PREFIX}${username}`;
}

/** Store partagé entre toutes les instances (chaque gateway instancie son propre service IAM). */
const sharedUsers = new Map<string, IamUser>(
  loadSeededUsersFromRealmConfigDev().map((seeded) => {
    const id = demoKeycloakId(seeded.username);
    return [
      id,
      { id, username: seeded.username, email: seeded.email, firstName: seeded.firstName, lastName: seeded.lastName },
    ];
  }),
);

/**
 * IAM factice pour la démo statique (aucun Keycloak).
 * Les utilisateurs proviennent de `user.seed.ts` ; les créations sont gardées en mémoire.
 */
export class DemoIAMService implements IAMService {
  private readonly users = sharedUsers;

  getUserProfileById(userId: string): Promise<IamUserProfile | null> {
    return Promise.resolve(this.users.get(userId) ?? null);
  }

  getUserByUsername(username: string): Promise<IamUser | null> {
    const user = [...this.users.values()].find((u) => u.username === username);
    return Promise.resolve(user ?? null);
  }

  createUser(input: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    realmRoles: string[];
  }): Promise<IamUser> {
    const user: IamUser = {
      id: demoKeycloakId(input.username),
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
    return Promise.resolve();
  }

  assignRealmRoles(_userId: string, _realmRoles: string[]): Promise<void> {
    return Promise.resolve();
  }

  isUserAbsentFromKeycloak(userId: string): Promise<boolean> {
    return Promise.resolve(!this.users.has(userId));
  }

  updateUserProfile(userId: string, input: Partial<IamUserProfile>): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
      });
    }
    return Promise.resolve();
  }

  sendPasswordResetEmail(_userId: string, _clientId: string): Promise<void> {
    return Promise.resolve();
  }
}
