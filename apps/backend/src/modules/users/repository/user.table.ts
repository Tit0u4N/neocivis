import { index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['ADMIN', 'EMPLOYEE', 'CITIZEN']);

export const users = pgTable(
  'users',
  {
    // "BY DEFAULT" permet d'insérer un id fixe pendant le seeding,
    // tout en gardant l'auto-increment pour les insertions normales.
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    keycloakId: text('keycloak_id').notNull(),
    username: text('username').notNull().default(''),
    email: text('email').notNull().default(''),
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name').notNull().default(''),
    role: userRole('role').notNull(),
    profilePictureUrl: text('profile_picture_url'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('users_keycloak_id_idx').on(t.keycloakId),
    index('users_username_idx').on(t.username),
    index('users_username_keycloak_id_idx').on(t.username, t.keycloakId),
  ],
);
