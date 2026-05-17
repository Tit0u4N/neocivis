// biome-ignore-all lint/suspicious/useAwait: mock file

import type { User } from '../user.types';
import type {
  InsertCitizenFromKeycloakInput,
  InsertSeededUserInput,
  IUserRepository,
  UpdateUserProfileInput,
  UpsertUserFromHeadersInput,
} from './user.repository.interface';

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
      keycloakId: input.keycloakId,
      username: input.username ?? '',
      email: input.email ?? '',
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      createdAt: now,
      updatedAt: now,
      role: input.role,
      deletedAt: null,
    };
    this.users.push(user);
  }

  async updateFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const existing = await this.getByKeycloakId(input.keycloakId);
    if (!existing) {
      return;
    }

    existing.role = input.role;
    existing.username = input.username ?? '';
    existing.email = input.email ?? '';
    existing.firstName = input.firstName ?? '';
    existing.lastName = input.lastName ?? '';
    existing.updatedAt = new Date();
  }

  async insertCitizenFromKeycloak(input: InsertCitizenFromKeycloakInput): Promise<void> {
    const now = new Date();
    const user: User = {
      id: this.autoId++,
      keycloakId: input.keycloakId,
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      createdAt: now,
      updatedAt: now,
      role: 'CITIZEN',
      deletedAt: null,
    };
    this.users.push(user);
  }

  async updateProfile(input: UpdateUserProfileInput): Promise<void> {
    const existing = await this.getByKeycloakId(input.keycloakId);
    if (!existing || existing.deletedAt !== null) {
      return;
    }
    existing.username = input.username;
    existing.email = input.email;
    existing.firstName = input.firstName;
    existing.lastName = input.lastName;
    existing.updatedAt = new Date();
  }

  async markDeletedByKeycloakId(keycloakId: string): Promise<void> {
    const existing = await this.getByKeycloakId(keycloakId);
    if (!existing) {
      return;
    }
    existing.deletedAt = new Date();
    existing.updatedAt = new Date();
  }

  async insertSeeded(input: InsertSeededUserInput): Promise<void> {
    const now = new Date();
    const user: User = {
      id: input.id,
      keycloakId: input.keycloakId,
      username: input.username ?? '',
      email: input.email ?? '',
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      createdAt: now,
      updatedAt: now,
      role: input.role,
      deletedAt: null,
    };
    this.users.push(user);
    this.autoId = Math.max(this.autoId, input.id + 1);
  }

  async deleteAll(): Promise<void> {
    this.users = [];
    this.autoId = 1;
  }

  async setNextId(nextId: number): Promise<void> {
    this.autoId = Math.max(1, nextId);
  }
}
