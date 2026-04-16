'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/theme.store';

export function AppProvider({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.remove('dark');
      return;
    }

    if (theme === 'dark') {
      root.classList.add('dark');
      return;
    }

    // system — follow OS preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    root.classList.toggle('dark', mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      root.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <>{children}</>;
}
