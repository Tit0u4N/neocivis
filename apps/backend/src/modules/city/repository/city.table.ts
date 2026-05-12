import { index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from '@/modules/users/repository/user.table';

export const cities = pgTable(
  'cities',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    adminUserId: integer('admin_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('cities_admin_user_id_uniq').on(t.adminUserId), index('cities_name_idx').on(t.name)],
);

/**
 * Employees: appartiennent à UNE seule city (userId unique).
 * Admin n'est pas enregistré ici (adminUserId est sur `cities`).
 */
export const cityEmployees = pgTable(
  'city_employees',
  {
    cityId: text('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.cityId, t.userId] }),
    uniqueIndex('city_employees_user_id_uniq').on(t.userId),
    index('city_employees_city_id_idx').on(t.cityId),
  ],
);

/**
 * Citizens: peuvent appartenir à plusieurs cities.
 */
export const cityCitizens = pgTable(
  'city_citizens',
  {
    cityId: text('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.cityId, t.userId] }),
    index('city_citizens_city_id_idx').on(t.cityId),
    index('city_citizens_user_id_idx').on(t.userId),
  ],
);

