import type { IUserRepository, UpsertUserFromHeadersInput } from './user.repository.interface';
import type { User } from './user.types';

export class UserService {
  constructor(private repository: IUserRepository) {}

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
    const existing = await this.repository.getByKeycloakId(input.keycloakId);
    if (!existing) {
      await this.repository.insertFromHeaders(input);
      return;
    }
    await this.repository.updateFromHeaders(input);
  }
}
