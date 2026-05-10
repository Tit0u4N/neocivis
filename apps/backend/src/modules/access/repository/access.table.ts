import { sql } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { cities } from '@/modules/city/repository/city.table';
import { users } from '@/modules/users/repository/user.table';

/**
 * Un rôle appartient à UNE city. Le couple (cityId, name) est unique :
 * deux villes peuvent réutiliser le même nom de rôle.
 */
export const roles = pgTable(
  'roles',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cityId: text('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('roles_city_id_name_uniq').on(t.cityId, t.name), index('roles_city_id_idx').on(t.cityId)],
);

/**
 * Permissions attachées à un rôle. La clé est validée côté service via
 * `permission.catalog.ts` (pas de FK vers une table de permissions car le
 * catalogue est figé en code).
 */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionKey: text('permission_key').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissionKey] }),
    index('role_permissions_role_id_idx').on(t.roleId),
  ],
);

/**
 * Affectation d'un rôle à un employé. Multi-rôles (N rôles par employé).
 * La cohérence (le rôle appartient bien à la même city que l'employé) est
 * validée au niveau du service (pas de contrainte SQL composite ici).
 */
export const employeeRoleAssignments = pgTable(
  'employee_role_assignments',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId] }),
    index('employee_role_assignments_user_id_idx').on(t.userId),
    index('employee_role_assignments_role_id_idx').on(t.roleId),
  ],
);
