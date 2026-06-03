import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryThreadRepository } from '../repository/thread.inmemory.repository';
import { ThreadService } from './thread.service';

const CITY_ID = 'city-1';
const AUTHOR_ID = 'user-1';

describe('ThreadService', () => {
  let repo: InMemoryThreadRepository;
  let service: ThreadService;

  beforeEach(() => {
    repo = new InMemoryThreadRepository();
    service = new ThreadService(repo);
  });

  // ── Categories ────────────────────────────────────────────────────────────

  describe('categories', () => {
    it('creates and lists a category', async () => {
      const cat = await service.createCategory(CITY_ID, {
        emoji: '⚽',
        label: 'Sport',
        order: 0,
      });
      expect(cat.cityId).toBe(CITY_ID);
      expect(cat.emoji).toBe('⚽');

      const list = await service.listCategories(CITY_ID);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(cat.id);
    });

    it('lists categories sorted by order', async () => {
      await service.createCategory(CITY_ID, { emoji: '🎓', label: 'School', order: 2 });
      await service.createCategory(CITY_ID, { emoji: '⚽', label: 'Sport', order: 0 });
      await service.createCategory(CITY_ID, { emoji: '📒', label: 'Culture', order: 1 });

      const list = await service.listCategories(CITY_ID);
      expect(list.map((c) => c.label)).toEqual(['Sport', 'Culture', 'School']);
    });

    it('updates a category', async () => {
      const cat = await service.createCategory(CITY_ID, { emoji: '⚽', label: 'Sport' });
      const updated = await service.updateCategory(CITY_ID, cat.id, { label: 'Sports' });
      expect(updated.label).toBe('Sports');
      expect(updated.emoji).toBe('⚽');
    });

    it('deletes a category', async () => {
      const cat = await service.createCategory(CITY_ID, { emoji: '⚽', label: 'Sport' });
      await service.deleteCategory(CITY_ID, cat.id);
      const list = await service.listCategories(CITY_ID);
      expect(list).toHaveLength(0);
    });

    it('throws when category not found in city', async () => {
      await expect(service.getCategoryById(CITY_ID, 'no-such-id')).rejects.toThrow('ThreadCategory not found');
    });

    it('scopes categories to city', async () => {
      await service.createCategory(CITY_ID, { emoji: '⚽', label: 'Sport' });
      const list = await service.listCategories('other-city');
      expect(list).toHaveLength(0);
    });
  });

  // ── Threads ───────────────────────────────────────────────────────────────

  describe('threads', () => {
    let categoryId: string;

    beforeEach(async () => {
      const cat = await service.createCategory(CITY_ID, { emoji: '⚽', label: 'Sport' });
      categoryId = cat.id;
    });

    it('creates a thread', async () => {
      const thread = await service.createThread(
        CITY_ID,
        { title: 'Test thread', categoryId, body: 'Body text' },
        AUTHOR_ID,
      );
      expect(thread.cityId).toBe(CITY_ID);
      expect(thread.authorId).toBe(AUTHOR_ID);
      expect(thread.deleted).toBe(false);
      expect(thread.archived).toBe(false);
      expect(thread.likes).toBe(0);
    });

    it('lists non-deleted, non-archived threads as summaries', async () => {
      await service.createThread(CITY_ID, { title: 'Thread 1', categoryId, body: 'body' }, AUTHOR_ID);
      const thread2 = await service.createThread(CITY_ID, { title: 'Thread 2', categoryId, body: 'body' }, AUTHOR_ID);
      await service.softDeleteThread(CITY_ID, thread2.id);

      const result = await service.listThreads(CITY_ID);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Thread 1');
      expect(result.data[0].replyCount).toBe(0);
      expect(result.total).toBe(1);
    });

    it('filters threads by category', async () => {
      const cat2 = await service.createCategory(CITY_ID, { emoji: '📒', label: 'Culture' });
      await service.createThread(CITY_ID, { title: 'Sport thread', categoryId, body: 'body' }, AUTHOR_ID);
      await service.createThread(CITY_ID, { title: 'Culture thread', categoryId: cat2.id, body: 'body' }, AUTHOR_ID);

      const result = await service.listThreads(CITY_ID, categoryId);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Sport thread');
    });

    it('paginates threads correctly', async () => {
      for (let i = 1; i <= 5; i++) {
        await service.createThread(CITY_ID, { title: `Thread ${i}`, categoryId, body: 'body' }, AUTHOR_ID);
      }
      const page1 = await service.listThreads(CITY_ID, undefined, 1, 2);
      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.totalPages).toBe(3);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(2);

      const page3 = await service.listThreads(CITY_ID, undefined, 3, 2);
      expect(page3.data).toHaveLength(1);
    });

    it('soft-deletes and restores a thread', async () => {
      const thread = await service.createThread(CITY_ID, { title: 'Thread', categoryId, body: 'body' }, AUTHOR_ID);
      const deleted = await service.softDeleteThread(CITY_ID, thread.id);
      expect(deleted.deleted).toBe(true);
      expect(deleted.deletedAt).toBeDefined();

      const restored = await service.restoreThread(CITY_ID, thread.id);
      expect(restored.deleted).toBe(false);
      expect(restored.deletedAt).toBeUndefined();
    });

    it('archives thread and hides from list; unarchive restores it', async () => {
      const thread = await service.createThread(CITY_ID, { title: 'Thread', categoryId, body: 'body' }, AUTHOR_ID);

      const archived = await service.archiveThread(CITY_ID, thread.id);
      expect(archived.archived).toBe(true);
      expect(archived.archivedAt).toBeDefined();

      const listAfterArchive = await service.listThreads(CITY_ID);
      expect(listAfterArchive.data).toHaveLength(0);
      expect(listAfterArchive.total).toBe(0);

      const unarchived = await service.unarchiveThread(CITY_ID, thread.id);
      expect(unarchived.archived).toBe(false);
      expect(unarchived.archivedAt).toBeUndefined();

      const listAfterUnarchive = await service.listThreads(CITY_ID);
      expect(listAfterUnarchive.data).toHaveLength(1);
    });

    it('scopes threads to city', async () => {
      await service.createThread(CITY_ID, { title: 'Thread', categoryId, body: 'body' }, AUTHOR_ID);
      const result = await service.listThreads('other-city');
      expect(result.data).toHaveLength(0);
    });

    it('rejects create when category not in city', async () => {
      await expect(
        service.createThread(CITY_ID, { title: 'Thread', categoryId: 'bad-cat-id', body: 'body' }, AUTHOR_ID),
      ).rejects.toThrow('ThreadCategory not found');
    });
  });

  // ── Messages ──────────────────────────────────────────────────────────────

  describe('messages', () => {
    let threadId: string;

    beforeEach(async () => {
      const cat = await service.createCategory(CITY_ID, { emoji: '⚽', label: 'Sport' });
      const thread = await service.createThread(
        CITY_ID,
        { title: 'Thread', categoryId: cat.id, body: 'body' },
        AUTHOR_ID,
      );
      threadId = thread.id;
    });

    it('adds a message with empty reactions', async () => {
      const msg = await service.addMessage(CITY_ID, threadId, { body: 'Hello!' }, AUTHOR_ID);
      expect(msg.threadId).toBe(threadId);
      expect(msg.authorId).toBe(AUTHOR_ID);
      expect(msg.deleted).toBe(false);
      expect(msg.reactions).toEqual([]);
    });

    it('counts non-deleted messages as replyCount', async () => {
      await service.addMessage(CITY_ID, threadId, { body: 'Reply 1' }, AUTHOR_ID);
      const msg2 = await service.addMessage(CITY_ID, threadId, { body: 'Reply 2' }, AUTHOR_ID);
      await service.softDeleteMessage(CITY_ID, threadId, msg2.id);

      const { data } = await service.listThreads(CITY_ID);
      expect(data[0].replyCount).toBe(1);
    });

    it('soft-deletes and restores a message', async () => {
      const msg = await service.addMessage(CITY_ID, threadId, { body: 'Hello!' }, AUTHOR_ID);
      const deleted = await service.softDeleteMessage(CITY_ID, threadId, msg.id);
      expect(deleted.deleted).toBe(true);

      const restored = await service.restoreMessage(CITY_ID, threadId, msg.id);
      expect(restored.deleted).toBe(false);
    });

    it('thread detail includes all messages (deleted + active)', async () => {
      await service.addMessage(CITY_ID, threadId, { body: 'A' }, AUTHOR_ID);
      const msg2 = await service.addMessage(CITY_ID, threadId, { body: 'B' }, AUTHOR_ID);
      await service.softDeleteMessage(CITY_ID, threadId, msg2.id);

      const detail = await service.getThreadDetail(CITY_ID, threadId);
      expect(detail.messages).toHaveLength(2);
    });

    it('adds emoji reaction and is idempotent', async () => {
      const msg = await service.addMessage(CITY_ID, threadId, { body: 'Hello!' }, AUTHOR_ID);

      const r1 = await service.addReaction(CITY_ID, threadId, msg.id, { emoji: '👍' }, 'user-a');
      expect(r1.reactions).toEqual([{ emoji: '👍', userIds: ['user-a'] }]);

      // Second user reacts
      const r2 = await service.addReaction(CITY_ID, threadId, msg.id, { emoji: '👍' }, 'user-b');
      expect(r2.reactions[0].userIds).toEqual(['user-a', 'user-b']);

      // Same user again — idempotent
      const r3 = await service.addReaction(CITY_ID, threadId, msg.id, { emoji: '👍' }, 'user-a');
      expect(r3.reactions[0].userIds).toHaveLength(2);
    });

    it('removes emoji reaction and prunes empty bucket', async () => {
      const msg = await service.addMessage(CITY_ID, threadId, { body: 'Hello!' }, AUTHOR_ID);
      await service.addReaction(CITY_ID, threadId, msg.id, { emoji: '👍' }, 'user-a');

      const r = await service.removeReaction(CITY_ID, threadId, msg.id, '👍', 'user-a');
      // Bucket empty → pruned
      expect(r.reactions).toEqual([]);
    });
  });

  // ── Moderation ────────────────────────────────────────────────────────────

  describe('moderation', () => {
    it('mutes and unmutes a user', async () => {
      await service.muteUser(CITY_ID, AUTHOR_ID);
      let list = await service.listModeration(CITY_ID);
      expect(list).toHaveLength(1);
      expect(list[0].muted).toBe(true);

      await service.unmuteUser(CITY_ID, AUTHOR_ID);
      list = await service.listModeration(CITY_ID);
      expect(list).toHaveLength(0);
    });

    it('bans and unbans a user', async () => {
      await service.banUser(CITY_ID, AUTHOR_ID);
      let list = await service.listModeration(CITY_ID);
      expect(list).toHaveLength(1);
      expect(list[0].banned).toBe(true);

      await service.unbanUser(CITY_ID, AUTHOR_ID);
      list = await service.listModeration(CITY_ID);
      expect(list).toHaveLength(0);
    });

    it('can be both muted and banned simultaneously', async () => {
      await service.muteUser(CITY_ID, AUTHOR_ID);
      await service.banUser(CITY_ID, AUTHOR_ID);

      const list = await service.listModeration(CITY_ID);
      expect(list).toHaveLength(1);
      expect(list[0].muted).toBe(true);
      expect(list[0].banned).toBe(true);
    });

    it('scopes moderation to city', async () => {
      await service.banUser(CITY_ID, AUTHOR_ID);
      const list = await service.listModeration('other-city');
      expect(list).toHaveLength(0);
    });
  });
});
