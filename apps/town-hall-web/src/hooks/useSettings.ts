'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import type { Theme } from '@/stores/theme.store';
import { useThemeStore } from '@/stores/theme.store';

export type Language = 'fr' | 'en';

type UseSettingsReturn = {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export function useSettings(): UseSettingsReturn {
  const { i18n: i18nInstance } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  const currentLanguage = i18nInstance.language as Language;

  const changeLanguage = useCallback(async (lang: Language) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('neocivis-language', lang);
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    theme,
    setTheme,
  };
}
