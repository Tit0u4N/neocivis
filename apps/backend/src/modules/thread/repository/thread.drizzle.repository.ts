import type {
  CreateMessageInput,
  CreateThreadCategoryInput,
  CreateThreadInput,
  ForumUserModeration,
  Thread,
  ThreadCategory,
  ThreadMessage,
  UpdateThreadCategoryInput,
} from '@repo/contracts/thread';
import { and, asc, desc, eq } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import type { IThreadRepository } from './thread.repository.interface';
import { forumUserModerations, threadCategories, threadMessages, threads } from './thread.table';

function mapRowToCategory(r: typeof threadCategories.$inferSelect): ThreadCategory {
  return {
    id: r.id,
    cityId: r.cityId,
    emoji: r.emoji,
    label: r.label,
    order: r.sortOrder ?? undefined,
  };
}

function mapRowToThread(r: typeof threads.$inferSelect): Thread {
  return {
    id: r.id,
    cityId: r.cityId,
    categoryId: r.categoryId,
    authorId: r.authorId,
    title: r.title,
    body: r.body,
    likes: r.likes,
    deleted: r.deleted,
    deletedAt: r.deletedAt?.toISOString(),
    archived: r.archived,
    archivedAt: r.archivedAt?.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function mapRowToMessage(r: typeof threadMessages.$inferSelect): ThreadMessage {
  return {
    id: r.id,
    threadId: r.threadId,
    cityId: r.cityId,
    authorId: r.authorId,
    body: r.body,
    reactions: r.reactions,
    deleted: r.deleted,
    deletedAt: r.deletedAt?.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function mapRowToModeration(r: typeof forumUserModerations.$inferSelect): ForumUserModeration {
  return {
    cityId: r.cityId,
    userId: r.userId,
    muted: r.muted,
    banned: r.banned,
  };
}

export class DrizzleThreadRepository implements IThreadRepository {
  // ── Categories ──────────────────────────────────────────────────────────────

  async findCategoriesByCityId(cityId: string): Promise<ThreadCategory[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(threadCategories)
      .where(eq(threadCategories.cityId, cityId))
      .orderBy(asc(threadCategories.sortOrder));
    return rows.map(mapRowToCategory);
  }

  async findCategoryByIdAndCityId(id: string, cityId: string): Promise<ThreadCategory | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(threadCategories)
      .where(and(eq(threadCategories.id, id), eq(threadCategories.cityId, cityId)))
      .limit(1);
    const r = rows[0];
    return r ? mapRowToCategory(r) : undefined;
  }

  async createCategory(input: CreateThreadCategoryInput & { id: string; cityId: string }): Promise<ThreadCategory> {
    const db = getDb();
    const rows = await db
      .insert(threadCategories)
      .values({
        id: input.id,
        cityId: input.cityId,
        emoji: input.emoji,
        label: input.label,
        sortOrder: input.order ?? null,
      })
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error('Failed to insert thread category');
    }
    return mapRowToCategory(r);
  }

  async updateCategory(id: string, input: UpdateThreadCategoryInput): Promise<ThreadCategory | undefined> {
    const db = getDb();
    type CategoryPatch = Partial<Pick<typeof threadCategories.$inferInsert, 'emoji' | 'label' | 'sortOrder'>>;
    const patch: CategoryPatch = {};
    if (input.emoji !== undefined) {
      patch.emoji = input.emoji;
    }
    if (input.label !== undefined) {
      patch.label = input.label;
    }
    if ('order' in input) {
      patch.sortOrder = input.order ?? null;
    }
    if (Object.keys(patch).length === 0) {
      const rows = await db.select().from(threadCategories).where(eq(threadCategories.id, id)).limit(1);
      const r = rows[0];
      return r ? mapRowToCategory(r) : undefined;
    }
    const rows = await db.update(threadCategories).set(patch).where(eq(threadCategories.id, id)).returning();
    const r = rows[0];
    return r ? mapRowToCategory(r) : undefined;
  }

  async deleteCategory(id: string, cityId: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(threadCategories)
      .where(and(eq(threadCategories.id, id), eq(threadCategories.cityId, cityId)))
      .returning({ id: threadCategories.id });
    return rows.length > 0;
  }

  // ── Threads ──────────────────────────────────────────────────────────────────

  async findThreadsByCityId(cityId: string): Promise<Thread[]> {
    const db = getDb();
    const rows = await db.select().from(threads).where(eq(threads.cityId, cityId)).orderBy(desc(threads.createdAt));
    return rows.map(mapRowToThread);
  }

  async findThreadByIdAndCityId(id: string, cityId: string): Promise<Thread | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(threads)
      .where(and(eq(threads.id, id), eq(threads.cityId, cityId)))
      .limit(1);
    const r = rows[0];
    return r ? mapRowToThread(r) : undefined;
  }

  async createThread(
    input: CreateThreadInput & {
      id: string;
      cityId: string;
      authorId: number;
      likes: number;
      createdAt: string;
      updatedAt: string;
      deleted: false;
      archived: false;
    },
  ): Promise<Thread> {
    const db = getDb();
    const rows = await db
      .insert(threads)
      .values({
        id: input.id,
        cityId: input.cityId,
        categoryId: input.categoryId,
        authorId: input.authorId,
        title: input.title,
        body: input.body,
        likes: input.likes,
        deleted: input.deleted,
        archived: input.archived,
        createdAt: new Date(input.createdAt),
        updatedAt: new Date(input.updatedAt),
      })
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error('Failed to insert thread');
    }
    return mapRowToThread(r);
  }

  async updateThread(id: string, input: Partial<Thread>): Promise<Thread | undefined> {
    const db = getDb();
    type ThreadPatch = Partial<
      Pick<
        typeof threads.$inferInsert,
        'title' | 'body' | 'categoryId' | 'likes' | 'deleted' | 'deletedAt' | 'archived' | 'archivedAt' | 'updatedAt'
      >
    >;
    const patch: ThreadPatch = {};
    if (input.title !== undefined) {
      patch.title = input.title;
    }
    if (input.body !== undefined) {
      patch.body = input.body;
    }
    if (input.categoryId !== undefined) {
      patch.categoryId = input.categoryId;
    }
    if (input.likes !== undefined) {
      patch.likes = input.likes;
    }
    if (input.deleted !== undefined) {
      patch.deleted = input.deleted;
    }
    if (input.deletedAt !== undefined) {
      patch.deletedAt = new Date(input.deletedAt);
    }
    if (input.archived !== undefined) {
      patch.archived = input.archived;
    }
    if (input.archivedAt !== undefined) {
      patch.archivedAt = new Date(input.archivedAt);
    }
    if (input.updatedAt !== undefined) {
      patch.updatedAt = new Date(input.updatedAt);
    }
    if (Object.keys(patch).length === 0) {
      const rows = await db.select().from(threads).where(eq(threads.id, id)).limit(1);
      const r = rows[0];
      return r ? mapRowToThread(r) : undefined;
    }
    const rows = await db.update(threads).set(patch).where(eq(threads.id, id)).returning();
    const r = rows[0];
    return r ? mapRowToThread(r) : undefined;
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  async findMessagesByThreadId(threadId: string): Promise<ThreadMessage[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(threadMessages)
      .where(eq(threadMessages.threadId, threadId))
      .orderBy(asc(threadMessages.createdAt));
    return rows.map(mapRowToMessage);
  }

  async findMessageByIdAndThreadId(id: string, threadId: string): Promise<ThreadMessage | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(threadMessages)
      .where(and(eq(threadMessages.id, id), eq(threadMessages.threadId, threadId)))
      .limit(1);
    const r = rows[0];
    return r ? mapRowToMessage(r) : undefined;
  }

  async createMessage(
    input: CreateMessageInput & {
      id: string;
      threadId: string;
      cityId: string;
      authorId: number;
      reactions: [];
      createdAt: string;
      updatedAt: string;
      deleted: false;
    },
  ): Promise<ThreadMessage> {
    const db = getDb();
    const rows = await db
      .insert(threadMessages)
      .values({
        id: input.id,
        threadId: input.threadId,
        cityId: input.cityId,
        authorId: input.authorId,
        body: input.body,
        reactions: input.reactions,
        deleted: input.deleted,
        createdAt: new Date(input.createdAt),
        updatedAt: new Date(input.updatedAt),
      })
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error('Failed to insert thread message');
    }
    return mapRowToMessage(r);
  }

  async updateMessage(id: string, input: Partial<ThreadMessage>): Promise<ThreadMessage | undefined> {
    const db = getDb();
    type MessagePatch = Partial<
      Pick<typeof threadMessages.$inferInsert, 'body' | 'reactions' | 'deleted' | 'deletedAt' | 'updatedAt'>
    >;
    const patch: MessagePatch = {};
    if (input.body !== undefined) {
      patch.body = input.body;
    }
    if (input.reactions !== undefined) {
      patch.reactions = input.reactions;
    }
    if (input.deleted !== undefined) {
      patch.deleted = input.deleted;
    }
    if (input.deletedAt !== undefined) {
      patch.deletedAt = new Date(input.deletedAt);
    }
    if (input.updatedAt !== undefined) {
      patch.updatedAt = new Date(input.updatedAt);
    }
    if (Object.keys(patch).length === 0) {
      const rows = await db.select().from(threadMessages).where(eq(threadMessages.id, id)).limit(1);
      const r = rows[0];
      return r ? mapRowToMessage(r) : undefined;
    }
    const rows = await db.update(threadMessages).set(patch).where(eq(threadMessages.id, id)).returning();
    const r = rows[0];
    return r ? mapRowToMessage(r) : undefined;
  }

  // ── Moderation ───────────────────────────────────────────────────────────────

  async findModerationsByCityId(cityId: string): Promise<ForumUserModeration[]> {
    const db = getDb();
    const rows = await db.select().from(forumUserModerations).where(eq(forumUserModerations.cityId, cityId));
    return rows.map(mapRowToModeration);
  }

  async findModeration(cityId: string, userId: number): Promise<ForumUserModeration | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(forumUserModerations)
      .where(and(eq(forumUserModerations.cityId, cityId), eq(forumUserModerations.userId, userId)))
      .limit(1);
    const r = rows[0];
    return r ? mapRowToModeration(r) : undefined;
  }

  async upsertModeration(record: ForumUserModeration): Promise<ForumUserModeration> {
    const db = getDb();
    const rows = await db
      .insert(forumUserModerations)
      .values({
        cityId: record.cityId,
        userId: record.userId,
        muted: record.muted,
        banned: record.banned,
      })
      .onConflictDoUpdate({
        target: [forumUserModerations.cityId, forumUserModerations.userId],
        set: { muted: record.muted, banned: record.banned },
      })
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error('Failed to upsert forum user moderation');
    }
    return mapRowToModeration(r);
  }

  // ── Bulk ─────────────────────────────────────────────────────────────────────

  async deleteAll(): Promise<void> {
    const db = getDb();
    await db.delete(forumUserModerations);
    await db.delete(threadCategories); // cascades → threads → thread_messages
  }
}
