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
import type { IThreadRepository } from './thread.repository.interface';

export class InMemoryThreadRepository implements IThreadRepository {
  private categories: ThreadCategory[] = [];
  private threads: Thread[] = [];
  private messages: ThreadMessage[] = [];
  private moderations: ForumUserModeration[] = [];

  // ── Categories ──────────────────────────────────────────────────────────────

  findCategoriesByCityId(cityId: string): Promise<ThreadCategory[]> {
    return Promise.resolve(this.categories.filter((c) => c.cityId === cityId));
  }

  findCategoryByIdAndCityId(id: string, cityId: string): Promise<ThreadCategory | undefined> {
    return Promise.resolve(this.categories.find((c) => c.id === id && c.cityId === cityId));
  }

  createCategory(input: CreateThreadCategoryInput & { id: string; cityId: string }): Promise<ThreadCategory> {
    const category: ThreadCategory = {
      id: input.id,
      cityId: input.cityId,
      emoji: input.emoji,
      label: input.label,
      order: input.order,
    };
    this.categories.push(category);
    return Promise.resolve(category);
  }

  updateCategory(id: string, input: UpdateThreadCategoryInput): Promise<ThreadCategory | undefined> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const updated = { ...this.categories[index], ...input } as ThreadCategory;
    this.categories[index] = updated;
    return Promise.resolve(updated);
  }

  deleteCategory(id: string, cityId: string): Promise<boolean> {
    const index = this.categories.findIndex((c) => c.id === id && c.cityId === cityId);
    if (index === -1) {
      return Promise.resolve(false);
    }
    this.categories.splice(index, 1);
    return Promise.resolve(true);
  }

  // ── Threads ──────────────────────────────────────────────────────────────────

  findThreadsByCityId(cityId: string): Promise<Thread[]> {
    return Promise.resolve(this.threads.filter((t) => t.cityId === cityId));
  }

  findThreadByIdAndCityId(id: string, cityId: string): Promise<Thread | undefined> {
    return Promise.resolve(this.threads.find((t) => t.id === id && t.cityId === cityId));
  }

  createThread(
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
    const thread: Thread = {
      id: input.id,
      cityId: input.cityId,
      categoryId: input.categoryId,
      authorId: input.authorId,
      title: input.title,
      body: input.body,
      likes: input.likes,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      deleted: input.deleted,
      archived: input.archived,
    };
    this.threads.push(thread);
    return Promise.resolve(thread);
  }

  updateThread(id: string, input: Partial<Thread>): Promise<Thread | undefined> {
    const index = this.threads.findIndex((t) => t.id === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const updated = { ...this.threads[index], ...input, id } as Thread;
    this.threads[index] = updated;
    return Promise.resolve(updated);
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  findMessagesByThreadId(threadId: string): Promise<ThreadMessage[]> {
    return Promise.resolve(this.messages.filter((m) => m.threadId === threadId));
  }

  findMessageByIdAndThreadId(id: string, threadId: string): Promise<ThreadMessage | undefined> {
    return Promise.resolve(this.messages.find((m) => m.id === id && m.threadId === threadId));
  }

  createMessage(
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
    const message: ThreadMessage = {
      id: input.id,
      threadId: input.threadId,
      cityId: input.cityId,
      authorId: input.authorId,
      body: input.body,
      reactions: input.reactions,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      deleted: input.deleted,
    };
    this.messages.push(message);
    return Promise.resolve(message);
  }

  updateMessage(id: string, input: Partial<ThreadMessage>): Promise<ThreadMessage | undefined> {
    const index = this.messages.findIndex((m) => m.id === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const updated = { ...this.messages[index], ...input, id } as ThreadMessage;
    this.messages[index] = updated;
    return Promise.resolve(updated);
  }

  // ── Moderation ───────────────────────────────────────────────────────────────

  findModerationsByCityId(cityId: string): Promise<ForumUserModeration[]> {
    return Promise.resolve(this.moderations.filter((m) => m.cityId === cityId));
  }

  findModeration(cityId: string, userId: number): Promise<ForumUserModeration | undefined> {
    return Promise.resolve(this.moderations.find((m) => m.cityId === cityId && m.userId === userId));
  }

  upsertModeration(record: ForumUserModeration): Promise<ForumUserModeration> {
    const index = this.moderations.findIndex((m) => m.cityId === record.cityId && m.userId === record.userId);
    if (index === -1) {
      this.moderations.push(record);
    } else {
      this.moderations[index] = record;
    }
    return Promise.resolve(record);
  }

  deleteAll(): Promise<void> {
    this.categories = [];
    this.threads = [];
    this.messages = [];
    this.moderations = [];
    return Promise.resolve();
  }
}
