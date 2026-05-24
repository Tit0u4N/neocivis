'use client';

import { useEffect, useState } from 'react';
import { useLoaderStore } from '@/stores/loader.store';
import { NeocivisLoader } from './NeocivisLoader';

// Delay before showing the loader — avoids flicker on fast requests.
const SHOW_DELAY_MS = 200;

export function GlobalLoader() {
  const isActive = useLoaderStore((s) => s.count > 0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isActive]);

  if (visible) {
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
  return null;
}
