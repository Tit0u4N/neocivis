import type { ApiErrorDto, OperationSuccessDto } from '@repo/contracts';
import {
  AddReactionInput,
  CreateMessageInput,
  CreateThreadCategoryInput,
  CreateThreadInput,
  type ForumUserModeration,
  type Thread,
  type ThreadCategory,
  type ThreadDetail,
  type ThreadMessage,
  type ThreadSummary,
  ThreadsListQuery,
  UpdateThreadCategoryInput,
  UpdateThreadInput,
} from '@repo/contracts/thread';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ThreadService } from '@/modules/thread/service/thread.service';

export class ThreadController {
  constructor(private threadService: ThreadService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    // Categories
    app.get('/categories', (c) => this.listCategories(c));
    app.post('/categories', (c) => this.createCategory(c));
    app.put('/categories/:categoryId', (c) => this.updateCategory(c));
    app.delete('/categories/:categoryId', (c) => this.deleteCategory(c));

    // Moderation
    app.get('/moderation/users', (c) => this.listModeration(c));
    app.post('/moderation/users/:userId/mute', (c) => this.muteUser(c));
    app.post('/moderation/users/:userId/unmute', (c) => this.unmuteUser(c));
    app.post('/moderation/users/:userId/ban', (c) => this.banUser(c));
    app.post('/moderation/users/:userId/unban', (c) => this.unbanUser(c));

    // Threads
    app.get('/', (c) => this.listThreads(c));
    app.post('/', (c) => this.createThread(c));
    app.get('/:id', (c) => this.getThreadDetail(c));
    app.put('/:id', (c) => this.updateThread(c));
    app.delete('/:id', (c) => this.softDeleteThread(c));
    app.post('/:id/restore', (c) => this.restoreThread(c));
    app.post('/:id/archive', (c) => this.archiveThread(c));
    app.post('/:id/unarchive', (c) => this.unarchiveThread(c));

    // Messages
    app.post('/:id/messages', (c) => this.addMessage(c));
    app.delete('/:id/messages/:messageId', (c) => this.softDeleteMessage(c));
    app.post('/:id/messages/:messageId/restore', (c) => this.restoreMessage(c));

    // Reactions
    app.post('/:id/messages/:messageId/reactions', (c) => this.addReaction(c));
    app.delete('/:id/messages/:messageId/reactions/:emoji', (c) => this.removeReaction(c));

    return app;
  }

  private getCityId(c: Context): string {
    return c.req.param('cityId');
  }

  private getUserId(c: Context): string {
    return (c.get('userId') as string) ?? 'unknown';
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  private async listCategories(c: Context): Promise<ControllerJson<ThreadCategory[], 200, readonly []>> {
    const cityId = this.getCityId(c);
    const body: ThreadCategory[] = await this.threadService.listCategories(cityId);
    return c.json(body, 200);
  }

  private async createCategory(c: Context): Promise<ControllerJson<ThreadCategory, 201>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = CreateThreadCategoryInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    const category = await this.threadService.createCategory(cityId, parsed.data);
    const body: ThreadCategory = category;
    return c.json(body, 201);
  }

  private async updateCategory(c: Context): Promise<ControllerJson<ThreadCategory>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = UpdateThreadCategoryInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const category = await this.threadService.updateCategory(cityId, c.req.param('categoryId'), parsed.data);
      const body: ThreadCategory = category;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'ThreadCategory not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async deleteCategory(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = this.getCityId(c);
    try {
      await this.threadService.deleteCategory(cityId, c.req.param('categoryId'));
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch {
      return c.json({ error: 'ThreadCategory not found' } satisfies ApiErrorDto, 404);
    }
  }

  // ── Moderation ───────────────────────────────────────────────────────────────

  private async listModeration(c: Context): Promise<ControllerJson<ForumUserModeration[], 200, readonly []>> {
    const cityId = this.getCityId(c);
    const body: ForumUserModeration[] = await this.threadService.listModeration(cityId);
    return c.json(body, 200);
  }

  private async muteUser(c: Context): Promise<ControllerJson<ForumUserModeration>> {
    const cityId = this.getCityId(c);
    const userId = c.req.param('userId');
    const record = await this.threadService.muteUser(cityId, userId);
    const body: ForumUserModeration = record;
    return c.json(body, 200);
  }

  private async unmuteUser(c: Context): Promise<ControllerJson<ForumUserModeration>> {
    const cityId = this.getCityId(c);
    const userId = c.req.param('userId');
    const record = await this.threadService.unmuteUser(cityId, userId);
    const body: ForumUserModeration = record;
    return c.json(body, 200);
  }

  private async banUser(c: Context): Promise<ControllerJson<ForumUserModeration>> {
    const cityId = this.getCityId(c);
    const userId = c.req.param('userId');
    const record = await this.threadService.banUser(cityId, userId);
    const body: ForumUserModeration = record;
    return c.json(body, 200);
  }

  private async unbanUser(c: Context): Promise<ControllerJson<ForumUserModeration>> {
    const cityId = this.getCityId(c);
    const userId = c.req.param('userId');
    const record = await this.threadService.unbanUser(cityId, userId);
    const body: ForumUserModeration = record;
    return c.json(body, 200);
  }

  // ── Threads ──────────────────────────────────────────────────────────────────

  private async listThreads(c: Context): Promise<ControllerJson<ThreadSummary[], 200, readonly []>> {
    const cityId = this.getCityId(c);
    const queryParsed = ThreadsListQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
    const categoryId = queryParsed.success ? queryParsed.data.categoryId : undefined;
    const body: ThreadSummary[] = await this.threadService.listThreads(cityId, categoryId);
    return c.json(body, 200);
  }

  private async createThread(c: Context): Promise<ControllerJson<Thread, 201>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = CreateThreadInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const thread = await this.threadService.createThread(cityId, parsed.data, this.getUserId(c));
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

  private async updateThread(c: Context): Promise<ControllerJson<Thread>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = UpdateThreadInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const thread = await this.threadService.updateThread(cityId, c.req.param('id'), parsed.data);
      const body: Thread = thread;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async softDeleteThread(c: Context): Promise<ControllerJson<Thread>> {
    const cityId = this.getCityId(c);
    try {
      const thread = await this.threadService.softDeleteThread(cityId, c.req.param('id'));
      const body: Thread = thread;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async restoreThread(c: Context): Promise<ControllerJson<Thread>> {
    const cityId = this.getCityId(c);
    try {
      const thread = await this.threadService.restoreThread(cityId, c.req.param('id'));
      const body: Thread = thread;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async archiveThread(c: Context): Promise<ControllerJson<Thread>> {
    const cityId = this.getCityId(c);
    try {
      const thread = await this.threadService.archiveThread(cityId, c.req.param('id'));
      const body: Thread = thread;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async unarchiveThread(c: Context): Promise<ControllerJson<Thread>> {
    const cityId = this.getCityId(c);
    try {
      const thread = await this.threadService.unarchiveThread(cityId, c.req.param('id'));
      const body: Thread = thread;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  private async addMessage(c: Context): Promise<ControllerJson<ThreadMessage, 201>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = CreateMessageInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const message = await this.threadService.addMessage(cityId, c.req.param('id'), parsed.data, this.getUserId(c));
      const body: ThreadMessage = message;
      return c.json(body, 201);
    } catch {
      return c.json({ error: 'Thread not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async softDeleteMessage(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
    try {
      const message = await this.threadService.softDeleteMessage(cityId, c.req.param('id'), c.req.param('messageId'));
      const body: ThreadMessage = message;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async restoreMessage(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
    try {
      const message = await this.threadService.restoreMessage(cityId, c.req.param('id'), c.req.param('messageId'));
      const body: ThreadMessage = message;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
    }
  }

  // ── Reactions ─────────────────────────────────────────────────────────────────

  private async addReaction(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
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
        this.getUserId(c),
      );
      const body: ThreadMessage = message;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async removeReaction(c: Context): Promise<ControllerJson<ThreadMessage>> {
    const cityId = this.getCityId(c);
    try {
      const message = await this.threadService.removeReaction(
        cityId,
        c.req.param('id'),
        c.req.param('messageId'),
        decodeURIComponent(c.req.param('emoji')),
        this.getUserId(c),
      );
      const body: ThreadMessage = message;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Message not found' } satisfies ApiErrorDto, 404);
    }
  }
}
