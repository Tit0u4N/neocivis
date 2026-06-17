import { eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import type { User } from '../user.types';
import type {
  InsertCitizenFromKeycloakInput,
  InsertSeededUserInput,
  IUserRepository,
  UpdateUserProfileInput,
  UpsertUserFromHeadersInput,
} from './user.repository.interface';
import { users } from './user.table';

function mapRowToUser(r: typeof users.$inferSelect): User {
  return {
    id: r.id,
    keycloakId: r.keycloakId,
    username: r.username,
    email: r.email,
    firstName: r.firstName,
    lastName: r.lastName,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    role: r.role,
    deletedAt: r.deletedAt,
    profilePictureUrl: r.profilePictureUrl ?? null,
  };
}

export class DrizzleUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    const db = getDb();
    const rows = await db.select().from(users);
    return rows.map(mapRowToUser);
  }

  async getById(id: number): Promise<User | undefined> {
    const db = getDb();
    const row = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const r = row[0];
    return r ? mapRowToUser(r) : undefined;
  }

  async getByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }
    const db = getDb();
    const rows = await db.select().from(users).where(inArray(users.id, ids));
    return rows.map(mapRowToUser);
  }

  async getByKeycloakId(keycloakId: string): Promise<User | undefined> {
    const db = getDb();
    const row = await db.select().from(users).where(eq(users.keycloakId, keycloakId)).limit(1);
    const r = row[0];
    return r ? mapRowToUser(r) : undefined;
  }

  async insertFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const db = getDb();
    const { keycloakId, role, username, email, firstName, lastName } = input;
    await db.insert(users).values({
      keycloakId,
      role,
      username: username ?? '',
      email: email ?? '',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
    });
  }

  async updateFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const db = getDb();
    const { keycloakId, role, username, email, firstName, lastName } = input;
    await db
      .update(users)
      .set({
        role,
        username: username ?? '',
        email: email ?? '',
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        updatedAt: sql`now()`,
      })
      .where(eq(users.keycloakId, keycloakId));
  }

  async insertCitizenFromKeycloak(input: InsertCitizenFromKeycloakInput): Promise<void> {
    const db = getDb();
    await db.insert(users).values({
      keycloakId: input.keycloakId,
      role: 'CITIZEN',
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  }

  async updateProfile(input: UpdateUserProfileInput): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({
        username: input.username,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        updatedAt: sql`now()`,
      })
      .where(eq(users.keycloakId, input.keycloakId));
  }

  async markDeletedByKeycloakId(keycloakId: string): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({ deletedAt: sql`now()`, updatedAt: sql`now()` })
      .where(eq(users.keycloakId, keycloakId));
  }

  async updateProfilePictureUrl(keycloakId: string, url: string | null): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({ profilePictureUrl: url, updatedAt: sql`now()` })
      .where(eq(users.keycloakId, keycloakId));
  }

  async insertSeeded(input: InsertSeededUserInput): Promise<void> {
    const db = getDb();
    const { id, keycloakId, role, username, email, firstName, lastName, profilePictureUrl } = input;
    await db.insert(users).values({
      id,
      keycloakId,
      role,
      username: username ?? '',
      email: email ?? '',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      profilePictureUrl: profilePictureUrl ?? null,
    });
  }

  async deleteAll(): Promise<void> {
    const db = getDb();
    await db.delete(users);
  }

  async setNextId(nextId: number): Promise<void> {
    const db = getDb();
    const safeNextId = Math.max(1, Math.floor(nextId));
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('users', 'id'), ${safeNextId}, false)`);
  }
}
