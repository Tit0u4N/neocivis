import { z } from 'zod';
import { CityId } from '../city/city.schema';

export const ThreadCategory = z.object({
  id: z.string().uuid(),
  cityId: CityId,
  emoji: z.string().min(1).max(8),
  label: z.string().min(1).max(60),
  order: z.number().int().nonnegative().optional(),
});
export type ThreadCategory = z.infer<typeof ThreadCategory>;

export const CreateThreadCategoryInput = z.object({
  emoji: z.string().min(1).max(8),
  label: z.string().min(1).max(60),
  order: z.number().int().nonnegative().optional(),
});
export type CreateThreadCategoryInput = z.infer<typeof CreateThreadCategoryInput>;

export const UpdateThreadCategoryInput = CreateThreadCategoryInput.partial();
export type UpdateThreadCategoryInput = z.infer<typeof UpdateThreadCategoryInput>;

export const ThreadReaction = z.object({
  emoji: z.string().min(1).max(8),
  userIds: z.array(z.number().int()),
});
export type ThreadReaction = z.infer<typeof ThreadReaction>;

export const ThreadMessage = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  cityId: CityId,
  authorId: z.number().int(),
  body: z.string().min(1),
  reactions: z.array(ThreadReaction),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deleted: z.boolean(),
  deletedAt: z.string().datetime().optional(),
});
export type ThreadMessage = z.infer<typeof ThreadMessage>;

export const Thread = z.object({
  id: z.string().uuid(),
  cityId: CityId,
  categoryId: z.string().uuid(),
  authorId: z.number().int(),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  likes: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deleted: z.boolean(),
  deletedAt: z.string().datetime().optional(),
  archived: z.boolean(),
  archivedAt: z.string().datetime().optional(),
});
export type Thread = z.infer<typeof Thread>;

export const ThreadSummary = Thread.extend({
  replyCount: z.number().int().nonnegative(),
});
export type ThreadSummary = z.infer<typeof ThreadSummary>;

export const ThreadDetail = Thread.extend({
  messages: z.array(ThreadMessage),
});
export type ThreadDetail = z.infer<typeof ThreadDetail>;

export const CreateThreadInput = z.object({
  title: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  body: z.string().min(1),
});
export type CreateThreadInput = z.infer<typeof CreateThreadInput>;

export const UpdateThreadInput = CreateThreadInput.partial();
export type UpdateThreadInput = z.infer<typeof UpdateThreadInput>;

export const CreateMessageInput = z.object({
  body: z.string().min(1),
});
export type CreateMessageInput = z.infer<typeof CreateMessageInput>;

export const AddReactionInput = z.object({
  emoji: z.string().min(1).max(8),
});
export type AddReactionInput = z.infer<typeof AddReactionInput>;

export const ThreadsListQuery = z.object({
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
export type ThreadsListQuery = z.infer<typeof ThreadsListQuery>;

export const PaginatedThreadsResponse = z.object({
  data: z.array(ThreadSummary),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginatedThreadsResponse = z.infer<typeof PaginatedThreadsResponse>;

export const ForumUserModeration = z.object({
  cityId: CityId,
  userId: z.number().int(),
  muted: z.boolean(),
  banned: z.boolean(),
});
export type ForumUserModeration = z.infer<typeof ForumUserModeration>;
