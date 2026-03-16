import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import frCommon from '@/locales/fr/common.json';

export const defaultNS = 'common';
export const resources = {
  fr: {
    common: frCommon,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS,
  resources,
  interpolation: {
    // React escapes by default
    escapeValue: false,
  },
});

export default i18n;
