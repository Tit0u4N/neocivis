// biome-ignore-all lint/suspicious/useAwait: mock file

import type { User } from '../user.types';
import type { IUserRepository, UpsertUserFromHeadersInput } from './user.repository.interface';

export class InMemoryUserRepository implements IUserRepository {
  private autoId = 1;
  private users: User[] = [];

  async getAll(): Promise<User[]> {
    return this.users;
  }

  async getById(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }
    const set = new Set(ids);
    return this.users.filter((u) => set.has(u.id));
  }

  async getByKeycloakId(keycloakId: string): Promise<User | undefined> {
    return this.users.find((u) => u.keycloakId === keycloakId);
  }

  async insertFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const now = new Date();
    const user: User = {
      id: this.autoId++,
      seedId: input.seedId ?? null,
      keycloakId: input.keycloakId,
      username: input.username ?? '',
      email: input.email ?? '',
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      createdAt: now,
      updatedAt: now,
      role: input.role,
    };
    this.users.push(user);
  }

  async updateFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const existing = await this.getByKeycloakId(input.keycloakId);
    if (!existing) {
      return;
    }

    existing.role = input.role;
    existing.seedId = input.seedId ?? null;
    existing.username = input.username ?? '';
    existing.email = input.email ?? '';
    existing.firstName = input.firstName ?? '';
    existing.lastName = input.lastName ?? '';
    existing.updatedAt = new Date();
  }
}
