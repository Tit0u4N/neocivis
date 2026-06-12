import { index, pgTable, text } from 'drizzle-orm/pg-core';
import { cities } from '@/modules/city/repository/city.table';

export const establishments = pgTable(
  'establishments',
  {
    id: text('id').primaryKey(),
    cityId: text('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    address: text('address').notNull(),
    hours: text('hours').notNull(),
    phone: text('phone').notNull(),
    imageUrl: text('image_url'),
  },
  (t) => [index('establishments_city_id_idx').on(t.cityId)],
);
