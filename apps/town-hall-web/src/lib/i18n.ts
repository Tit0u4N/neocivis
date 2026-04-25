import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import frCommon from '@/locales/fr/common.json';

export const defaultNS = 'common';
export const resources = {
  fr: {
    common: frCommon,
  },
  en: {
    common: enCommon,
  },
} as const;

const savedLang = typeof window !== 'undefined' ? (localStorage.getItem('neocivis-language') ?? 'fr') : 'fr';

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: 'fr',
  defaultNS,
  resources,
  interpolation: {
    // React escapes by default
    escapeValue: false,
  },
});

export default i18n;
