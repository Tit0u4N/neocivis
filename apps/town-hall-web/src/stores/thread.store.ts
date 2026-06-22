import type {
  ForumUserModeration,
  PaginatedThreadsResponse,
  ThreadCategory,
  ThreadSummary,
} from '@repo/contracts/thread';
import { create } from 'zustand';

type PageCache = {
  threads: ThreadSummary[];
  page: number;
  total: number;
  hasMore: boolean;
};

type ThreadStore = {
  /** Per-category/all page cache. Key = categoryId | 'all' */
  pages: Record<string, PageCache>;
  categories: ThreadCategory[];
  moderation: ForumUserModeration[];

  // Actions
  setCategories: (categories: ThreadCategory[]) => void;
  setModeration: (moderation: ForumUserModeration[]) => void;
  /** Replace (or seed) page 1 for a given key */
  setPage: (key: string, response: PaginatedThreadsResponse) => void;
  /** Append a subsequent page to the existing cache */
  appendPage: (key: string, response: PaginatedThreadsResponse) => void;
  /** Clear thread page cache (call after create/archive/delete) */
  invalidate: () => void;
  getCacheFor: (key: string) => PageCache | undefined;
};

export const useThreadStore = create<ThreadStore>()((set, get) => ({
  pages: {},
  categories: [],
  moderation: [],

  setCategories: (categories) => set({ categories }),
  setModeration: (moderation) => set({ moderation }),

  setPage: (key, response) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [key]: {
          threads: response.data,
          page: response.page,
          total: response.total,
          hasMore: response.page < response.totalPages,
        },
      },
    })),

  appendPage: (key, response) =>
    set((state) => {
      const existing = state.pages[key];
      return {
        pages: {
          ...state.pages,
          [key]: {
            threads: [...(existing?.threads ?? []), ...response.data],
            page: response.page,
            total: response.total,
            hasMore: response.page < response.totalPages,
          },
        },
      };
    }),

  invalidate: () => set({ pages: {} }),

  getCacheFor: (key) => get().pages[key],
}));
