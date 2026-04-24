import { eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import { users } from './user.table';
import type { IUserRepository, UpsertUserFromHeadersInput } from './user.repository.interface';
import type { User } from './user.types';

function mapRowToUser(r: typeof users.$inferSelect): User {
  return {
    id: r.id,
    seedId: r.seedId,
    keycloakId: r.keycloakId,
    username: r.username,
    email: r.email,
    firstName: r.firstName,
    lastName: r.lastName,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    role: r.role,
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
    const { seedId, keycloakId, role, username, email, firstName, lastName } = input;
    await db.insert(users).values({
      seedId: seedId ?? null,
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
    const { seedId, keycloakId, role, username, email, firstName, lastName } = input;
    await db
      .update(users)
      .set({
        role,
        seedId: seedId ?? null,
        username: username ?? '',
        email: email ?? '',
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        updatedAt: sql`now()`,
      })
      .where(eq(users.keycloakId, keycloakId));
  }
}

