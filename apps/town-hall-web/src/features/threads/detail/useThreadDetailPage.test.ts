// @ts-nocheck

'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThreadStore } from '@/stores/thread.store';
import { useUserStore } from '@/stores/user.store';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockThreadService = {
  getById: vi.fn(),
  getCategories: vi.fn(),
  getModeration: vi.fn(),
  softDeleteMessage: vi.fn(),
  restoreMessage: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
  archive: vi.fn(),
  unarchive: vi.fn(),
  muteUser: vi.fn(),
  unmuteUser: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
  addReaction: vi.fn(),
  removeReaction: vi.fn(),
  addMessage: vi.fn(),
};
const mockUserService = {
  getMe: vi.fn(),
  getByIds: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ threadService: mockThreadService, userService: mockUserService }),
}));

import { useThreadDetailPage } from './useThreadDetailPage';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CATEGORY = { id: 'cat-1', cityId: 1, emoji: '📢', label: 'Annonces' };

const MESSAGE = {
  id: 'msg-1',
  threadId: 'thread-1',
  cityId: 1,
  authorId: 43,
  body: 'Réponse test',
  reactions: [],
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  deleted: false,
};

const THREAD_DETAIL = {
  id: 'thread-1',
  cityId: 1,
  categoryId: 'cat-1',
  authorId: 42,
  title: 'Thread de test',
  body: 'Contenu du thread',
  likes: 5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
  archived: false,
  messages: [MESSAGE],
};

const MODERATION = [{ cityId: 1, userId: 43, muted: true, banned: false }];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  useThreadStore.setState({ pages: {}, categories: [], moderation: [] });
  useUserStore.setState({ users: {} });
  mockThreadService.getCategories.mockResolvedValue([]);
  mockThreadService.getModeration.mockResolvedValue([]);
  mockUserService.getMe.mockResolvedValue({ id: 42 });
  mockUserService.getByIds.mockResolvedValue([]);
});

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useThreadDetailPage', () => {
  describe('chargement initial', () => {
    it('démarre en isLoading=true', () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      expect(result.current.isLoading).toBe(true);
    });

    it('charge le thread et nettoie isLoading', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.thread).toEqual(THREAD_DETAIL);
      expect(result.current.error).toBeNull();
    });

    it('pose error quand getById échoue', async () => {
      mockThreadService.getById.mockRejectedValue(new Error('Not found'));
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBe('threads.detail.error');
    });

    it('résout les authorIds manquants après le fetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockUserService.getByIds.mockResolvedValue([
        { id: 42, username: 'alice', firstName: 'Alice', lastName: 'Dupont' },
        { id: 43, username: 'bob', firstName: 'Bob', lastName: 'Martin' },
      ]);
      renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(mockUserService.getByIds).toHaveBeenCalled());
      expect(mockUserService.getByIds).toHaveBeenCalledWith(expect.arrayContaining([42, 43]));
    });

    it('skip getByIds si tous les auteurs sont en store', async () => {
      useUserStore.setState({
        users: {
          42: { id: 42, username: 'alice', firstName: 'Alice', lastName: 'Dupont' },
          43: { id: 43, username: 'bob', firstName: 'Bob', lastName: 'Martin' },
        },
      });
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockUserService.getByIds).not.toHaveBeenCalled();
    });

    it('charge les catégories au montage', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.getCategories.mockResolvedValue([CATEGORY]);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.categories).toHaveLength(1));
    });

    it('skip fetchCategories si catégories déjà en store', async () => {
      useThreadStore.setState({ categories: [CATEGORY] });
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockThreadService.getCategories).not.toHaveBeenCalled();
    });

    it('définit currentUserId depuis getMe', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockUserService.getMe.mockResolvedValue({ id: 99 });
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.currentUserId).toBe(99));
    });
  });

  describe('actions message', () => {
    it('handleDeleteMessage appelle softDeleteMessage puis refetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.softDeleteMessage.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleDeleteMessage('msg-1');
      });

      expect(mockThreadService.softDeleteMessage).toHaveBeenCalledWith('thread-1', 'msg-1');
      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });

    it('handleRestoreMessage appelle restoreMessage puis refetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.restoreMessage.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleRestoreMessage('msg-1');
      });

      expect(mockThreadService.restoreMessage).toHaveBeenCalledWith('thread-1', 'msg-1');
      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });
  });

  describe('actions thread', () => {
    it('handleDeleteThread appelle softDelete puis refetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.softDelete.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleDeleteThread();
      });

      expect(mockThreadService.softDelete).toHaveBeenCalledWith('thread-1');
      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });

    it('handleRestoreThread appelle restore puis refetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.restore.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleRestoreThread();
      });

      expect(mockThreadService.restore).toHaveBeenCalledWith('thread-1');
      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });

    it('handleArchiveThread appelle archive puis refetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.archive.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleArchiveThread();
      });

      expect(mockThreadService.archive).toHaveBeenCalledWith('thread-1');
      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });

    it('handleUnarchiveThread appelle unarchive puis refetch', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.unarchive.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleUnarchiveThread();
      });

      expect(mockThreadService.unarchive).toHaveBeenCalledWith('thread-1');
      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });
  });

  describe('modération', () => {
    it('handleToggleMute mute un utilisateur non-muté', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.muteUser.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleToggleMute(43, false);
      });

      expect(mockThreadService.muteUser).toHaveBeenCalledWith(43);
      expect(mockThreadService.unmuteUser).not.toHaveBeenCalled();
    });

    it('handleToggleMute unmute un utilisateur muté', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.unmuteUser.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleToggleMute(43, true);
      });

      expect(mockThreadService.unmuteUser).toHaveBeenCalledWith(43);
      expect(mockThreadService.muteUser).not.toHaveBeenCalled();
    });

    it('handleToggleBan ban un utilisateur non-banni', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.banUser.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleToggleBan(43, false);
      });

      expect(mockThreadService.banUser).toHaveBeenCalledWith(43);
      expect(mockThreadService.unbanUser).not.toHaveBeenCalled();
    });

    it('handleToggleBan unban un utilisateur banni', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.unbanUser.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleToggleBan(43, true);
      });

      expect(mockThreadService.unbanUser).toHaveBeenCalledWith(43);
      expect(mockThreadService.banUser).not.toHaveBeenCalled();
    });

    it('handleToggleMute rafraîchit la modération après action', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.muteUser.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const callsBefore = mockThreadService.getModeration.mock.calls.length;
      await act(async () => {
        await result.current.handleToggleMute(43, false);
      });

      expect(mockThreadService.getModeration.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("getModerationForUser retourne l'entrée correcte", async () => {
      mockThreadService.getModeration.mockResolvedValue(MODERATION);
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await waitFor(() => expect(result.current.getModerationForUser(43)).toBeDefined());

      expect(result.current.getModerationForUser(43)).toEqual(MODERATION[0]);
    });

    it('getModerationForUser retourne undefined pour user inconnu', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.getModerationForUser(999)).toBeUndefined();
    });
  });

  describe('réactions', () => {
    it('handleToggleReaction ajoute une réaction quand non réagit', async () => {
      mockUserService.getMe.mockResolvedValue({ id: 42 });
      const threadWithReaction = {
        ...THREAD_DETAIL,
        messages: [{ ...MESSAGE, reactions: [{ emoji: '👍', userIds: [99] }] }],
      };
      mockThreadService.getById.mockResolvedValue(threadWithReaction);
      mockThreadService.addReaction.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await waitFor(() => expect(result.current.currentUserId).toBe(42));

      await act(async () => {
        await result.current.handleToggleReaction('msg-1', '👍');
      });

      expect(mockThreadService.addReaction).toHaveBeenCalledWith('thread-1', 'msg-1', { emoji: '👍' });
      expect(mockThreadService.removeReaction).not.toHaveBeenCalled();
    });

    it('handleToggleReaction supprime une réaction déjà posée', async () => {
      mockUserService.getMe.mockResolvedValue({ id: 42 });
      const threadWithReaction = {
        ...THREAD_DETAIL,
        messages: [{ ...MESSAGE, reactions: [{ emoji: '👍', userIds: [42] }] }],
      };
      mockThreadService.getById.mockResolvedValue(threadWithReaction);
      mockThreadService.removeReaction.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await waitFor(() => expect(result.current.currentUserId).toBe(42));

      await act(async () => {
        await result.current.handleToggleReaction('msg-1', '👍');
      });

      expect(mockThreadService.removeReaction).toHaveBeenCalledWith('thread-1', 'msg-1', '👍');
      expect(mockThreadService.addReaction).not.toHaveBeenCalled();
    });

    it('handleToggleReaction ne fait rien si thread est null', async () => {
      mockThreadService.getById.mockRejectedValue(new Error('Not found'));
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleToggleReaction('msg-1', '👍');
      });

      expect(mockThreadService.addReaction).not.toHaveBeenCalled();
      expect(mockThreadService.removeReaction).not.toHaveBeenCalled();
    });

    it('handleToggleReaction ne fait rien si messageId inconnu', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleToggleReaction('msg-inexistant', '👍');
      });

      expect(mockThreadService.addReaction).not.toHaveBeenCalled();
    });
  });

  describe('réponse', () => {
    it('handleSubmitReply ne fait rien si replyBody vide', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleSubmitReply();
      });

      expect(mockThreadService.addMessage).not.toHaveBeenCalled();
    });

    it('handleSubmitReply ne fait rien si replyBody uniquement des espaces', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setReplyBody('   '));
      await act(async () => {
        await result.current.handleSubmitReply();
      });

      expect(mockThreadService.addMessage).not.toHaveBeenCalled();
    });

    it('handleSubmitReply envoie la réponse et vide le corps', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.addMessage.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setReplyBody('Ma réponse'));
      await act(async () => {
        await result.current.handleSubmitReply();
      });

      expect(mockThreadService.addMessage).toHaveBeenCalledWith('thread-1', { body: 'Ma réponse' });
      expect(result.current.replyBody).toBe('');
    });

    it('handleSubmitReply refetch le thread après envoi', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.addMessage.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setReplyBody('Ma réponse'));
      await act(async () => {
        await result.current.handleSubmitReply();
      });

      expect(mockThreadService.getById).toHaveBeenCalledTimes(2);
    });

    it('isReplying est false après soumission réussie', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      mockThreadService.addMessage.mockResolvedValue({});
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.setReplyBody('Ma réponse'));
      await act(async () => {
        await result.current.handleSubmitReply();
      });

      expect(result.current.isReplying).toBe(false);
    });
  });

  describe('état UI', () => {
    it('toggleShowDeletedMessages bascule showDeletedMessages', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.showDeletedMessages).toBe(false);
      act(() => result.current.toggleShowDeletedMessages());
      expect(result.current.showDeletedMessages).toBe(true);
      act(() => result.current.toggleShowDeletedMessages());
      expect(result.current.showDeletedMessages).toBe(false);
    });

    it('handleBack navigue vers /dashboard/threads', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleBack());
      expect(mockPush).toHaveBeenCalledWith('/dashboard/threads');
    });
  });

  describe('resolveUser', () => {
    it('retourne le user du store', async () => {
      const user = { id: 42, username: 'alice', firstName: 'Alice', lastName: 'Dupont' };
      useUserStore.setState({ users: { 42: user } });
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.resolveUser(42)).toEqual(user);
    });

    it('retourne undefined pour user inconnu', async () => {
      mockThreadService.getById.mockResolvedValue(THREAD_DETAIL);
      const { result } = renderHook(() => useThreadDetailPage('thread-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.resolveUser(999)).toBeUndefined();
    });
  });
});
