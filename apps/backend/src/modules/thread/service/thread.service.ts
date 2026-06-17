import { randomUUID } from 'node:crypto';
import type {
  AddReactionInput,
  CreateMessageInput,
  CreateThreadCategoryInput,
  CreateThreadInput,
  ForumUserModeration,
  PaginatedThreadsResponse,
  Thread,
  ThreadCategory,
  ThreadDetail,
  ThreadMessage,
  ThreadReaction,
  ThreadSummary,
  UpdateThreadCategoryInput,
  UpdateThreadInput,
} from '@repo/contracts/thread';
import type { IThreadRepository } from '../repository/thread.repository.interface';

export class ThreadService {
  constructor(private repository: IThreadRepository) {}

  // ── Categories ──────────────────────────────────────────────────────────────

  async listCategories(cityId: string): Promise<ThreadCategory[]> {
    const categories = await this.repository.findCategoriesByCityId(cityId);
    return categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getCategoryById(cityId: string, id: string): Promise<ThreadCategory> {
    const category = await this.repository.findCategoryByIdAndCityId(id, cityId);
    if (!category) {
      throw new Error(`ThreadCategory not found: ${id}`);
    }
    return category;
  }

  async createCategory(cityId: string, input: CreateThreadCategoryInput): Promise<ThreadCategory> {
    return await this.repository.createCategory({
      ...input,
      id: randomUUID(),
      cityId,
    });
  }

  async updateCategory(cityId: string, id: string, input: UpdateThreadCategoryInput): Promise<ThreadCategory> {
    await this.getCategoryById(cityId, id);
    const updated = await this.repository.updateCategory(id, input);
    if (!updated) {
      throw new Error(`ThreadCategory not found: ${id}`);
    }
    return updated;
  }

  async deleteCategory(cityId: string, id: string): Promise<void> {
    await this.getCategoryById(cityId, id);
    const deleted = await this.repository.deleteCategory(id, cityId);
    if (!deleted) {
      throw new Error(`ThreadCategory not found: ${id}`);
    }
  }

  // ── Threads ──────────────────────────────────────────────────────────────────

  async listThreads(cityId: string, categoryId?: string, page = 1, limit = 20): Promise<PaginatedThreadsResponse> {
    const threads = await this.repository.findThreadsByCityId(cityId);
    // Exclude soft-deleted and archived threads from the active list
    const visible = threads.filter((t) => !(t.deleted || t.archived));
    const filtered = categoryId ? visible.filter((t) => t.categoryId === categoryId) : visible;
    const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = sorted.length;
    const start = (page - 1) * limit;
    const slice = sorted.slice(start, start + limit);
    const data = await Promise.all(
      slice.map(async (t) => {
        const messages = await this.repository.findMessagesByThreadId(t.id);
        const replyCount = messages.filter((m) => !m.deleted).length;
        return { ...t, replyCount } satisfies ThreadSummary;
      }),
    );
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getThreadById(cityId: string, id: string): Promise<Thread> {
    const thread = await this.repository.findThreadByIdAndCityId(id, cityId);
    if (!thread) {
      throw new Error(`Thread not found: ${id}`);
    }
    return thread;
  }

  async getThreadDetail(cityId: string, id: string): Promise<ThreadDetail> {
    const thread = await this.getThreadById(cityId, id);
    const messages = await this.repository.findMessagesByThreadId(id);
    const sorted = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { ...thread, messages: sorted };
  }

  async createThread(cityId: string, input: CreateThreadInput, authorId: number): Promise<Thread> {
    // Verify category exists in this city
    await this.getCategoryById(cityId, input.categoryId);
    return await this.repository.createThread({
      ...input,
      id: randomUUID(),
      cityId,
      authorId,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
      archived: false,
    });
  }

  async updateThread(cityId: string, id: string, input: UpdateThreadInput): Promise<Thread> {
    await this.getThreadById(cityId, id);
    if (input.categoryId) {
      await this.getCategoryById(cityId, input.categoryId);
    }
    const updated = await this.repository.updateThread(id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Thread not found: ${id}`);
    }
    return updated;
  }

  async softDeleteThread(cityId: string, id: string): Promise<Thread> {
    await this.getThreadById(cityId, id);
    const updated = await this.repository.updateThread(id, {
      deleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Thread not found: ${id}`);
    }
    return updated;
  }

  async restoreThread(cityId: string, id: string): Promise<Thread> {
    const thread = await this.repository.findThreadByIdAndCityId(id, cityId);
    if (!thread) {
      throw new Error(`Thread not found: ${id}`);
    }
    const updated = await this.repository.updateThread(id, {
      deleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Thread not found: ${id}`);
    }
    return updated;
  }

  async archiveThread(cityId: string, id: string): Promise<Thread> {
    await this.getThreadById(cityId, id);
    const updated = await this.repository.updateThread(id, {
      archived: true,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Thread not found: ${id}`);
    }
    return updated;
  }

  async unarchiveThread(cityId: string, id: string): Promise<Thread> {
    const thread = await this.repository.findThreadByIdAndCityId(id, cityId);
    if (!thread) {
      throw new Error(`Thread not found: ${id}`);
    }
    const updated = await this.repository.updateThread(id, {
      archived: false,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Thread not found: ${id}`);
    }
    return updated;
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  async getMessageById(cityId: string, threadId: string, messageId: string): Promise<ThreadMessage> {
    const message = await this.repository.findMessageByIdAndThreadId(messageId, threadId);
    if (!message || message.cityId !== cityId) {
      throw new Error(`Message not found: ${messageId}`);
    }
    return message;
  }

  async addMessage(
    cityId: string,
    threadId: string,
    input: CreateMessageInput,
    authorId: number,
  ): Promise<ThreadMessage> {
    // Verify thread exists (soft-deleted threads can still receive replies for restore purposes)
    const thread = await this.repository.findThreadByIdAndCityId(threadId, cityId);
    if (!thread) {
      throw new Error(`Thread not found: ${threadId}`);
    }
    return await this.repository.createMessage({
      ...input,
      id: randomUUID(),
      threadId,
      cityId,
      authorId,
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    });
  }

  async softDeleteMessage(cityId: string, threadId: string, messageId: string): Promise<ThreadMessage> {
    const message = await this.repository.findMessageByIdAndThreadId(messageId, threadId);
    if (!message || message.cityId !== cityId) {
      throw new Error(`Message not found: ${messageId}`);
    }
    const updated = await this.repository.updateMessage(messageId, {
      deleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Message not found: ${messageId}`);
    }
    return updated;
  }

  async restoreMessage(cityId: string, threadId: string, messageId: string): Promise<ThreadMessage> {
    const message = await this.repository.findMessageByIdAndThreadId(messageId, threadId);
    if (!message || message.cityId !== cityId) {
      throw new Error(`Message not found: ${messageId}`);
    }
    const updated = await this.repository.updateMessage(messageId, {
      deleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Message not found: ${messageId}`);
    }
    return updated;
  }

  async addReaction(
    cityId: string,
    threadId: string,
    messageId: string,
    input: AddReactionInput,
    userId: number,
  ): Promise<ThreadMessage> {
    const message = await this.repository.findMessageByIdAndThreadId(messageId, threadId);
    if (!message || message.cityId !== cityId) {
      throw new Error(`Message not found: ${messageId}`);
    }
    const existing = message.reactions.find((r) => r.emoji === input.emoji);
    let newReactions: ThreadReaction[];
    if (existing) {
      // Idempotent: add userId only if not already present
      if (existing.userIds.includes(userId)) {
        return message;
      }
      newReactions = message.reactions.map((r) =>
        r.emoji === input.emoji ? { ...r, userIds: [...r.userIds, userId] } : r,
      );
    } else {
      newReactions = [...message.reactions, { emoji: input.emoji, userIds: [userId] }];
    }
    const updated = await this.repository.updateMessage(messageId, {
      reactions: newReactions,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Message not found: ${messageId}`);
    }
    return updated;
  }

  async removeReaction(
    cityId: string,
    threadId: string,
    messageId: string,
    emoji: string,
    userId: number,
  ): Promise<ThreadMessage> {
    const message = await this.repository.findMessageByIdAndThreadId(messageId, threadId);
    if (!message || message.cityId !== cityId) {
      throw new Error(`Message not found: ${messageId}`);
    }
    const newReactions: ThreadReaction[] = message.reactions
      .map((r) => (r.emoji === emoji ? { ...r, userIds: r.userIds.filter((id) => id !== userId) } : r))
      // Prune empty buckets
      .filter((r) => r.userIds.length > 0);
    const updated = await this.repository.updateMessage(messageId, {
      reactions: newReactions,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Message not found: ${messageId}`);
    }
    return updated;
  }

  // ── Moderation ───────────────────────────────────────────────────────────────

  async listModeration(cityId: string): Promise<ForumUserModeration[]> {
    const all = await this.repository.findModerationsByCityId(cityId);
    return all.filter((m) => m.muted || m.banned);
  }

  private async getOrCreateModeration(cityId: string, userId: number): Promise<ForumUserModeration> {
    const existing = await this.repository.findModeration(cityId, userId);
    if (existing) {
      return existing;
    }
    return { cityId, userId, muted: false, banned: false };
  }

  async muteUser(cityId: string, userId: number): Promise<ForumUserModeration> {
    const record = await this.getOrCreateModeration(cityId, userId);
    return await this.repository.upsertModeration({ ...record, muted: true });
  }

  async unmuteUser(cityId: string, userId: number): Promise<ForumUserModeration> {
    const record = await this.getOrCreateModeration(cityId, userId);
    return await this.repository.upsertModeration({ ...record, muted: false });
  }

  async banUser(cityId: string, userId: number): Promise<ForumUserModeration> {
    const record = await this.getOrCreateModeration(cityId, userId);
    return await this.repository.upsertModeration({ ...record, banned: true });
  }

  async unbanUser(cityId: string, userId: number): Promise<ForumUserModeration> {
    const record = await this.getOrCreateModeration(cityId, userId);
    return await this.repository.upsertModeration({ ...record, banned: false });
  }
}
