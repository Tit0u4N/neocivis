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
  UpdateThreadCategoryInput,
  UpdateThreadInput,
} from '@repo/contracts/thread';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class ThreadService extends AbstractService {
  constructor(kyInstance: KyInstance, cityId?: string) {
    super(kyInstance, cityId ? { cityId } : { cityScoped: false });
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories(): Promise<ThreadCategory[]> {
    return await this.http.get('threads/categories').json<ThreadCategory[]>();
  }

  async createCategory(input: CreateThreadCategoryInput): Promise<ThreadCategory> {
    return await this.http.post('threads/categories', { json: input }).json<ThreadCategory>();
  }

  async updateCategory(id: string, input: UpdateThreadCategoryInput): Promise<ThreadCategory> {
    return await this.http.put(`threads/categories/${id}`, { json: input }).json<ThreadCategory>();
  }

  async deleteCategory(id: string): Promise<void> {
    await this.http.delete(`threads/categories/${id}`);
  }

  // ── Threads ──────────────────────────────────────────────────────────────────

  async getAll(query: { categoryId?: string; page?: number; limit?: number } = {}): Promise<PaginatedThreadsResponse> {
    const searchParams: Record<string, string | number> = {};
    if (query.categoryId) {
      searchParams.categoryId = query.categoryId;
    }
    if (query.page !== undefined) {
      searchParams.page = query.page;
    }
    if (query.limit !== undefined) {
      searchParams.limit = query.limit;
    }
    return await this.http.get('threads', { searchParams }).json<PaginatedThreadsResponse>();
  }

  async getById(id: string): Promise<ThreadDetail> {
    return await this.http.get(`threads/${id}`).json<ThreadDetail>();
  }

  async create(input: CreateThreadInput): Promise<Thread> {
    return await this.http.post('threads', { json: input }).json<Thread>();
  }

  async update(id: string, input: UpdateThreadInput): Promise<Thread> {
    return await this.http.put(`threads/${id}`, { json: input }).json<Thread>();
  }

  async softDelete(id: string): Promise<Thread> {
    return await this.http.delete(`threads/${id}`).json<Thread>();
  }

  async restore(id: string): Promise<Thread> {
    return await this.http.post(`threads/${id}/restore`).json<Thread>();
  }

  async archive(id: string): Promise<Thread> {
    return await this.http.post(`threads/${id}/archive`).json<Thread>();
  }

  async unarchive(id: string): Promise<Thread> {
    return await this.http.post(`threads/${id}/unarchive`).json<Thread>();
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  async addMessage(threadId: string, input: CreateMessageInput): Promise<ThreadMessage> {
    return await this.http.post(`threads/${threadId}/messages`, { json: input }).json<ThreadMessage>();
  }

  async softDeleteMessage(threadId: string, messageId: string): Promise<ThreadMessage> {
    return await this.http.delete(`threads/${threadId}/messages/${messageId}`).json<ThreadMessage>();
  }

  async restoreMessage(threadId: string, messageId: string): Promise<ThreadMessage> {
    return await this.http.post(`threads/${threadId}/messages/${messageId}/restore`).json<ThreadMessage>();
  }

  // ── Reactions ─────────────────────────────────────────────────────────────────

  async addReaction(threadId: string, messageId: string, input: AddReactionInput): Promise<ThreadMessage> {
    return await this.http
      .post(`threads/${threadId}/messages/${messageId}/reactions`, { json: input })
      .json<ThreadMessage>();
  }

  async removeReaction(threadId: string, messageId: string, emoji: string): Promise<ThreadMessage> {
    return await this.http
      .delete(`threads/${threadId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`)
      .json<ThreadMessage>();
  }

  // ── Moderation ───────────────────────────────────────────────────────────────

  async getModeration(): Promise<ForumUserModeration[]> {
    return await this.http.get('threads/moderation/users').json<ForumUserModeration[]>();
  }

  private async moderationAction(
    userId: string,
    action: 'mute' | 'unmute' | 'ban' | 'unban',
  ): Promise<ForumUserModeration> {
    return await this.http.post(`threads/moderation/users/${userId}/${action}`).json<ForumUserModeration>();
  }

  async muteUser(userId: string): Promise<ForumUserModeration> {
    return await this.moderationAction(userId, 'mute');
  }

  async unmuteUser(userId: string): Promise<ForumUserModeration> {
    return await this.moderationAction(userId, 'unmute');
  }

  async banUser(userId: string): Promise<ForumUserModeration> {
    return await this.moderationAction(userId, 'ban');
  }

  async unbanUser(userId: string): Promise<ForumUserModeration> {
    return await this.moderationAction(userId, 'unban');
  }
}
