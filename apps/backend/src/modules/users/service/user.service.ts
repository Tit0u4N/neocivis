import type { IAMService, IamUser, IamUserProfile } from '@/modules/iam/iam.service';
import type {
  InsertSeededUserInput,
  IUserRepository,
  UpsertUserFromHeadersInput,
} from '../repository/user.repository.interface';
import type { User } from '../user.types';

export class UserService {
  constructor(
    private repository: IUserRepository,
    private iamService: IAMService,
  ) {}

  async getIamUserByUsername(username: string): Promise<IamUser | null> {
    return await this.iamService.getUserByUsername(username);
  }

  async getIamProfileByKeycloakId(keycloakId: string): Promise<IamUserProfile | null> {
    return await this.iamService.getUserProfileById(keycloakId);
  }

  async getAll(): Promise<User[]> {
    return await this.repository.getAll();
  }

  async getById(id: number): Promise<User | undefined> {
    return await this.repository.getById(id);
  }

  async getByIds(ids: number[]): Promise<User[]> {
    return await this.repository.getByIds(ids);
  }

  async getByKeycloakId(keycloakId: string): Promise<User | undefined> {
    return await this.repository.getByKeycloakId(keycloakId);
  }

  /**
   * Synchronise l'utilisateur (Keycloak -> DB) à chaque requête authentifiée.
   * - si l'utilisateur n'existe pas: insert
   * - sinon: update (role + infos)
   */
  async syncFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const needsProfile =
      input.username === undefined ||
      input.email === undefined ||
      input.firstName === undefined ||
      input.lastName === undefined;

    let resolved = input;
    if (needsProfile) {
      const profile = await this.iamService.getUserProfileById(input.keycloakId);
      if (profile) {
        resolved = {
          ...input,
          username: input.username ?? profile.username,
          email: input.email ?? profile.email,
          firstName: input.firstName ?? profile.firstName,
          lastName: input.lastName ?? profile.lastName,
        };
      }
    }

    const existing = await this.repository.getByKeycloakId(input.keycloakId);
    if (!existing) {
      await this.repository.insertFromHeaders(resolved);
      return;
    }
    await this.repository.updateFromHeaders(resolved);
  }

  async seedFromKeycloak(input: InsertSeededUserInput): Promise<void> {
    const existing = await this.repository.getByKeycloakId(input.keycloakId);
    if (!existing) {
      await this.repository.insertSeeded(input);
      return;
    }
    await this.repository.updateFromHeaders(input);
  }

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }

  async setNextId(nextId: number): Promise<void> {
    await this.repository.setNextId(nextId);
  }

  /**
   * access.REGISTER : vérifie Keycloak, assigne le rôle realm CITIZEN, crée l'utilisateur en base.
   * Ne fait rien si l'utilisateur n'existe pas dans Keycloak.
   */
  async handleKeycloakRegister(keycloakId: string): Promise<void> {
    const profile = await this.iamService.getUserProfileById(keycloakId);
    if (!profile) {
      return;
    }

    await this.iamService.assignRealmRoles(keycloakId, ['CITIZEN']);

    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (existing) {
      if (existing.deletedAt !== null) {
        return;
      }
      await this.repository.updateProfile({
        keycloakId,
        username: profile.username ?? '',
        email: profile.email ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
      });
      return;
    }

    await this.repository.insertCitizenFromKeycloak({
      keycloakId,
      username: profile.username ?? '',
      email: profile.email ?? '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
    });
  }

  /**
   * access.UPDATE : met à jour nom / email depuis Keycloak (pas le rôle).
   */
  async handleKeycloakUpdate(keycloakId: string): Promise<void> {
    const profile = await this.iamService.getUserProfileById(keycloakId);
    if (!profile) {
      return;
    }

    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (!existing || existing.deletedAt !== null) {
      return;
    }

    await this.repository.updateProfile({
      keycloakId,
      username: profile.username ?? existing.username,
      email: profile.email ?? existing.email,
      firstName: profile.firstName ?? existing.firstName,
      lastName: profile.lastName ?? existing.lastName,
    });
  }

  /**
   * access.DELETE : marque l'utilisateur supprimé (soft delete) seulement si Keycloak
   * confirme que l'utilisateur n'existe plus (le webhook seul n'est pas une source de vérité).
   * Keycloak peut mettre quelques secondes à propager la suppression → poll court.
   */
  async handleKeycloakDelete(keycloakId: string, username?: string): Promise<void> {
    const maxAttempts = 20;
    const delayMs = 500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const absent = await this.iamService.isUserAbsentFromKeycloak(keycloakId, username);
      if (absent) {
        const existing = await this.repository.getByKeycloakId(keycloakId);
        if (!existing) {
          return;
        }
        await this.repository.markDeletedByKeycloakId(keycloakId);
        return;
      }
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}
