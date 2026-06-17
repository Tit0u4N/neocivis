import type { ApiErrorDto } from '@repo/contracts';
import {
  AddReactionInput,
  CreateMessageInput,
  CreateThreadInput,
  type PaginatedThreadsResponse,
  type Thread,
  type ThreadCategory,
  type ThreadDetail,
  type ThreadMessage,
  ThreadsListQuery,
} from '@repo/contracts/thread';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ThreadService } from '@/modules/thread/service/thread.service';

export class ThreadController {
  constructor(private threadService: ThreadService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    // Categories (read-only)
    app.get('/categories', (c) => this.listCategories(c));

    // Threads
    app.get('/', (c) => this.listThreads(c));
    app.post('/', (c) => this.createThread(c));
    app.get('/:id', (c) => this.getThreadDetail(c));
    app.delete('/:id', (c) => this.softDeleteThread(c));

    // Messages
    app.post('/:id/messages', (c) => this.addMessage(c));
    app.delete('/:id/messages/:messageId', (c) => this.softDeleteMessage(c));

    // Reactions
    app.post('/:id/messages/:messageId/reactions', (c) => this.addReaction(c));
    app.delete('/:id/messages/:messageId/reactions/:emoji', (c) => this.removeReaction(c));

    return app;
  }

  private getCityId(c: Context): string {
    return c.req.param('cityId');
  }

  private getUserId(c: Context): number {
    return c.var.user?.id ?? 0;
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  private async listCategories(c: Context): Promise<ControllerJson<ThreadCategory[], 200, readonly []>> {
    const cityId = this.getCityId(c);
    const body: ThreadCategory[] = await this.threadService.listCategories(cityId);
    return c.json(body, 200);
  }

  // ── Threads ──────────────────────────────────────────────────────────────────

  private async listThreads(c: Context): Promise<ControllerJson<PaginatedThreadsResponse, 200, [400]>> {
    const cityId = this.getCityId(c);
    const queryParsed = ThreadsListQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
    if (!queryParsed.success) {
      return c.json({ error: 'Invalid query parameters' } satisfies ApiErrorDto, 400);
    }
    const { categoryId, page, limit } = queryParsed.data;
    const body: PaginatedThreadsResponse = await this.threadService.listThreads(cityId, categoryId, page, limit);
    return c.json(body, 200);
  }

  private async createThread(c: Context): Promise<ControllerJson<Thread, 201>> {
    const cityId = this.getCityId(c);
    const userId = this.getUserId(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }
    const bodyJson = await c.req.json();
    const parsed = CreateThreadInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const thread = await this.threadService.createThread(cityId, parsed.data, userId);
      const body: Thread = thread;
      return c.json(body, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('not found')) {
        return c.json({ error: message } satisfies ApiErrorDto, 404);
      }
      return c.json({ error: message } satisfies ApiErrorDto, 400);
    }
  }

  private async getThreadDetail(c: Context): Promise<ControllerJson<ThreadDetail>> {
    const cityId = this.getCityId(c);
    try {
      const detail = await this.threadService.getThreadDetail(cityId, c.req.param('id'));
      const body: ThreadDetail = detail;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async softDeleteThread(c: Context): Promise<ControllerJson<Thread>> {
    const cityId = this.getCityId(c);
    const userId = this.getUserId(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }
    try {
      const thread = await this.threadService.getThreadById(cityId, c.req.param('id'));
      if (thread.authorId !== userId) {
        return c.json({ error: 'Forbidden' } satisfies ApiErrorDto, 403);
      }
      const updated = await this.threadService.softDeleteThread(cityId, c.req.param('id'));
      const body: Thread = updated;
      return c.json(body, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('not found')) {
        return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
      }
      return c.json({ error: message } satisfies ApiErrorDto, 400);
    }
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  private async addMessage(c: Context): Promise<ControllerJson<ThreadMessage, 201>> {
    const cityId = this.getCityId(c);
    const userId = this.getUserId(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }
    const bodyJson = await c.req.json();
    const parsed = CreateMessageInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const message = await this.threadService.addMessage(cityId, c.req.param('id'), parsed.data, userId);
      const body: ThreadMessage = message;
      return c.json(body, 201);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async softDeleteMessage(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
    const userId = this.getUserId(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }
    try {
      const message = await this.threadService.getMessageById(cityId, c.req.param('id'), c.req.param('messageId'));
      if (message.authorId !== userId) {
        return c.json({ error: 'Forbidden' } satisfies ApiErrorDto, 403);
      }
      const updated = await this.threadService.softDeleteMessage(cityId, c.req.param('id'), c.req.param('messageId'));
      const body: ThreadMessage = updated;
      return c.json(body, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('not found')) {
        return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
      }
      return c.json({ error: message } satisfies ApiErrorDto, 400);
    }
  }

  // ── Reactions ─────────────────────────────────────────────────────────────────

  private async addReaction(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
    const userId = this.getUserId(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }
    const bodyJson = await c.req.json();
    const parsed = AddReactionInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const message = await this.threadService.addReaction(
        cityId,
        c.req.param('id'),
        c.req.param('messageId'),
        parsed.data,
        userId,
      );
      const body: ThreadMessage = message;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async removeReaction(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
    const userId = this.getUserId(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' } satisfies ApiErrorDto, 401);
    }
    try {
      const message = await this.threadService.removeReaction(
        cityId,
        c.req.param('id'),
        c.req.param('messageId'),
        decodeURIComponent(c.req.param('emoji')),
        userId,
      );
      const body: ThreadMessage = message;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
    }
  }
}
