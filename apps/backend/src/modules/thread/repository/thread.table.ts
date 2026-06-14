import type { ThreadReaction } from '@repo/contracts/thread';
import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const threadCategories = pgTable(
  'thread_categories',
  {
    id: text('id').primaryKey(),
    cityId: text('city_id').notNull(),
    emoji: text('emoji').notNull(),
    label: text('label').notNull(),
    sortOrder: integer('sort_order'),
  },
  (t) => [index('thread_categories_city_id_idx').on(t.cityId)],
);

export const threads = pgTable(
  'threads',
  {
    id: text('id').primaryKey(),
    cityId: text('city_id').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => threadCategories.id, { onDelete: 'cascade' }),
    authorId: integer('author_id').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    likes: integer('likes').notNull().default(0),
    deleted: boolean('deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    archived: boolean('archived').notNull().default(false),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (t) => [
    index('threads_city_id_idx').on(t.cityId),
    index('threads_city_id_category_id_idx').on(t.cityId, t.categoryId),
  ],
);

export const threadMessages = pgTable(
  'thread_messages',
  {
    id: text('id').primaryKey(),
    threadId: text('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),
    cityId: text('city_id').notNull(),
    authorId: integer('author_id').notNull(),
    body: text('body').notNull(),
    reactions: jsonb('reactions').$type<ThreadReaction[]>().notNull(),
    deleted: boolean('deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (t) => [index('thread_messages_thread_id_idx').on(t.threadId)],
);

export const forumUserModerations = pgTable(
  'forum_user_moderations',
  {
    cityId: text('city_id').notNull(),
    userId: integer('user_id').notNull(),
    muted: boolean('muted').notNull().default(false),
    banned: boolean('banned').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.cityId, t.userId] }), index('forum_user_moderations_city_id_idx').on(t.cityId)],
);
