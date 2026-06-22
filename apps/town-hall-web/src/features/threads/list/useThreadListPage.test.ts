// @ts-nocheck
/** biome-ignore-all lint/suspicious/useAwait: TEST **/

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
  getAll: vi.fn(),
  getCategories: vi.fn(),
  getModeration: vi.fn(),
};
const mockUserService = {
  getByIds: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ threadService: mockThreadService, userService: mockUserService }),
}));

import { useThreadListPage } from './useThreadListPage';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CATEGORY = { id: 'cat-1', cityId: 1, emoji: '📢', label: 'Annonces', order: 0 };

const THREAD = {
  id: 'thread-1',
  cityId: 1,
  categoryId: 'cat-1',
  authorId: 42,
  title: 'Thread test',
  body: 'Contenu',
  likes: 0,
  replyCount: 2,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deleted: false,
  archived: false,
};

const PAGE_1 = { data: [THREAD], total: 25, page: 1, limit: 20, totalPages: 2 };
const PAGE_1_LAST = { data: [THREAD], total: 1, page: 1, limit: 20, totalPages: 1 };
const PAGE_2 = { data: [{ ...THREAD, id: 'thread-2' }], total: 25, page: 2, limit: 20, totalPages: 2 };

const MODERATION = [
  { cityId: 1, userId: 10, muted: true, banned: false },
  { cityId: 1, userId: 11, muted: false, banned: true },
  { cityId: 1, userId: 12, muted: true, banned: true },
];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  useThreadStore.setState({ pages: {}, categories: [], moderation: [] });
  useUserStore.setState({ users: {} });
  mockThreadService.getCategories.mockResolvedValue([]);
  mockThreadService.getModeration.mockResolvedValue([]);
  mockUserService.getByIds.mockResolvedValue([]);
});

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useThreadListPage', () => {
  describe('chargement initial', () => {
    it('charge les threads au montage et nettoie isLoading', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.threads).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });

    it('pose error quand getAll échoue', async () => {
      mockThreadService.getAll.mockRejectedValue(new Error('Network'));
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.error).toBe('threads.list.error'));
    });

    it('charge les catégories au montage', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      mockThreadService.getCategories.mockResolvedValue([CATEGORY]);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.categories).toHaveLength(1));
      expect(result.current.categories[0].id).toBe('cat-1');
    });

    it('skip fetchCategories si catégories déjà en store', async () => {
      useThreadStore.setState({ categories: [CATEGORY] });
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockThreadService.getCategories).not.toHaveBeenCalled();
    });

    it('charge la modération au montage', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      mockThreadService.getModeration.mockResolvedValue(MODERATION);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.mutedCount).toBe(2));
      expect(result.current.bannedCount).toBe(2);
    });

    it('utilise le cache si la page est déjà chargée', async () => {
      useThreadStore.setState({
        pages: { all: { threads: [THREAD], page: 1, total: 1, hasMore: false } },
      });
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.threads).toHaveLength(1));
      expect(mockThreadService.getAll).not.toHaveBeenCalled();
    });

    it('résout les authorIds manquants après le fetch', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      mockUserService.getByIds.mockResolvedValue([
        { id: 42, username: 'alice', firstName: 'Alice', lastName: 'Dupont' },
      ]);
      renderHook(() => useThreadListPage());
      await waitFor(() => expect(mockUserService.getByIds).toHaveBeenCalledWith([42]));
    });

    it('skip getByIds si tous les auteurs sont en store', async () => {
      useUserStore.setState({ users: { 42: { id: 42, username: 'alice', firstName: 'Alice', lastName: 'Dupont' } } });
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockUserService.getByIds).not.toHaveBeenCalled();
    });
  });

  describe('pagination', () => {
    it('handleLoadMore ajoute la page suivante', async () => {
      mockThreadService.getAll.mockResolvedValueOnce(PAGE_1).mockResolvedValueOnce(PAGE_2);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.hasMore).toBe(true);

      await act(async () => {
        await result.current.handleLoadMore();
      });

      expect(result.current.threads).toHaveLength(2);
      expect(result.current.hasMore).toBe(false);
    });

    it('handleLoadMore ne fait rien quand hasMore est false', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1_LAST);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.hasMore).toBe(false);

      await act(async () => {
        await result.current.handleLoadMore();
      });

      expect(mockThreadService.getAll).toHaveBeenCalledTimes(1);
    });

    it('hasMore est false quand totalPages === page', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1_LAST);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('filtre catégorie', () => {
    it('handleSelectCategory change activeCategoryId', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleSelectCategory('cat-1'));
      expect(result.current.activeCategoryId).toBe('cat-1');
    });

    it('handleSelectCategory avec undefined remet à "all"', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleSelectCategory('cat-1'));
      act(() => result.current.handleSelectCategory(undefined));
      expect(result.current.activeCategoryId).toBeUndefined();
    });

    it('changement de catégorie déclenche un nouveau fetch', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleSelectCategory('cat-1'));
      await waitFor(() =>
        expect(mockThreadService.getAll).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'cat-1' })),
      );
    });
  });

  describe('modal nouveau thread', () => {
    it('handleOpenNewThread affiche le modal', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleOpenNewThread());
      expect(result.current.showNewThreadModal).toBe(true);
    });

    it('handleCloseNewThread masque le modal', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleOpenNewThread());
      act(() => result.current.handleCloseNewThread());
      expect(result.current.showNewThreadModal).toBe(false);
    });

    it('handleThreadCreated ferme le modal et refetch', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleOpenNewThread());
      await act(async () => {
        await result.current.handleThreadCreated();
      });

      expect(result.current.showNewThreadModal).toBe(false);
      expect(mockThreadService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('navigation', () => {
    it('navigateToThread push vers la bonne URL', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.navigateToThread('thread-1'));
      expect(mockPush).toHaveBeenCalledWith('/dashboard/threads/thread-1');
    });
  });

  describe('resolveUser', () => {
    it('retourne le user du store', async () => {
      const user = { id: 42, username: 'alice', firstName: 'Alice', lastName: 'Dupont' };
      useUserStore.setState({ users: { 42: user } });
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.resolveUser(42)).toEqual(user);
    });

    it('retourne undefined pour user inconnu', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.resolveUser(999)).toBeUndefined();
    });
  });

  describe('compteurs modération', () => {
    it('calcule mutedCount et bannedCount correctement', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      mockThreadService.getModeration.mockResolvedValue(MODERATION);
      const { result } = renderHook(() => useThreadListPage());
      await waitFor(() => expect(result.current.mutedCount).toBe(2));
      expect(result.current.bannedCount).toBe(2);
    });

    it('démarre avec mutedCount=0 et bannedCount=0', async () => {
      mockThreadService.getAll.mockResolvedValue(PAGE_1);
      const { result } = renderHook(() => useThreadListPage());
      expect(result.current.mutedCount).toBe(0);
      expect(result.current.bannedCount).toBe(0);
    });
  });
});
