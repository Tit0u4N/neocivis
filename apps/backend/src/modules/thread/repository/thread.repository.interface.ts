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

export interface IThreadRepository {
  // Categories
  findCategoriesByCityId(cityId: string): Promise<ThreadCategory[]>;
  findCategoryByIdAndCityId(id: string, cityId: string): Promise<ThreadCategory | undefined>;
  createCategory(input: CreateThreadCategoryInput & { id: string; cityId: string }): Promise<ThreadCategory>;
  updateCategory(id: string, input: UpdateThreadCategoryInput): Promise<ThreadCategory | undefined>;
  deleteCategory(id: string, cityId: string): Promise<boolean>;

  // Threads
  findThreadsByCityId(cityId: string): Promise<Thread[]>;
  findThreadByIdAndCityId(id: string, cityId: string): Promise<Thread | undefined>;
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
  ): Promise<Thread>;
  updateThread(id: string, input: Partial<Thread>): Promise<Thread | undefined>;

  // Messages
  findMessagesByThreadId(threadId: string): Promise<ThreadMessage[]>;
  findMessageByIdAndThreadId(id: string, threadId: string): Promise<ThreadMessage | undefined>;
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
  ): Promise<ThreadMessage>;
  updateMessage(id: string, input: Partial<ThreadMessage>): Promise<ThreadMessage | undefined>;

  // Moderation
  findModerationsByCityId(cityId: string): Promise<ForumUserModeration[]>;
  findModeration(cityId: string, userId: number): Promise<ForumUserModeration | undefined>;
  upsertModeration(record: ForumUserModeration): Promise<ForumUserModeration>;

  // Bulk
  deleteAll(): Promise<void>;
}
