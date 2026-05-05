import type { ConfigLocale } from '@repo/contracts/config';
import { create } from 'zustand';

export type Locale = ConfigLocale;

type ConfigStore = {
  availableLocales: Locale[];
  defaultLocale: Locale;
  addLocale: (locale: Locale) => void;
  removeLocale: (locale: Locale) => void;
};

export const useConfigStore = create<ConfigStore>((set) => ({
  availableLocales: ['fr', 'en', 'de', 'it'],
  defaultLocale: 'fr',
  addLocale: (locale) =>
    set((s) => (s.availableLocales.includes(locale) ? s : { availableLocales: [...s.availableLocales, locale] })),
  removeLocale: (locale) =>
    set((s) => (locale === s.defaultLocale ? s : { availableLocales: s.availableLocales.filter((l) => l !== locale) })),
}));
