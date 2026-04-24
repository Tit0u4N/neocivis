import { index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['ADMIN', 'EMPLOYEE', 'CITIZEN']);

export const users = pgTable(
  'users',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    seedId: integer('seed_id'),
    keycloakId: text('keycloak_id').notNull(),
    username: text('username').notNull().default(''),
    email: text('email').notNull().default(''),
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name').notNull().default(''),
    role: userRole('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    keycloakIdIndex: index('users_keycloak_id_idx').on(t.keycloakId),
    usernameIndex: index('users_username_idx').on(t.username),
    usernameKeycloakIdIndex: index('users_username_keycloak_id_idx').on(t.username, t.keycloakId),
    seedIdIndex: index('users_seed_id_idx').on(t.seedId),
  }),
);

