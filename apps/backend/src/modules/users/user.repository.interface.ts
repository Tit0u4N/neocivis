import type { BaseUserRole, User } from './user.types';

export type UpsertUserFromHeadersInput = {
  seedId?: number;
  keycloakId: string;
  role: BaseUserRole;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User | undefined>;
  getByIds(ids: number[]): Promise<User[]>;
  getByKeycloakId(keycloakId: string): Promise<User | undefined>;
  insertFromHeaders(input: UpsertUserFromHeadersInput): Promise<void>;
  updateFromHeaders(input: UpsertUserFromHeadersInput): Promise<void>;
}

