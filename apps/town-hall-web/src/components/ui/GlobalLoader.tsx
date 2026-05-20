'use client';

import { useLoaderStore } from '@/stores/loader.store';
import { NeocivisLoader } from './NeocivisLoader';

export function GlobalLoader() {
  const isLoading = useLoaderStore((s) => s.count > 0);

  if (isLoading) {
    return (
      <div
        className={
          'pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center items-center py-3 transition-opacity duration-300 size-full bg-white/50 dark:bg-black/50'
        }
      >
        <NeocivisLoader variant="wave" size="sm" />
      </div>
    );
  }
  return null
}
