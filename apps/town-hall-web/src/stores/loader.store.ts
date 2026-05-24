'use client';

import { create } from 'zustand';

type LoaderStore = {
  count: number;
  startLoading: () => void;
  stopLoading: () => void;
};

export const useLoaderStore = create<LoaderStore>()((set) => ({
  count: 0,
  startLoading: () => set((s) => ({ count: s.count + 1 })),
  stopLoading: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
}));
