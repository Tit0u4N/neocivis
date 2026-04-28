import type { IAMService, IamUser, IamUserProfile } from '@/modules/iam/iam.service';
import type {
  InsertSeededUserInput,
  IUserRepository,
  UpsertUserFromHeadersInput,
} from './repository/user.repository.interface';
import type { User } from './user.types';

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
}
