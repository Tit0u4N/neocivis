import type { Language } from '@/i18n/LanguageContext';
import { AVAILABLE_LANGUAGES, useLanguage } from '@/i18n/LanguageContext';

export function useSettings() {
  const { language, setLanguage } = useLanguage();

  const handleSetLanguage = (lang: Language) => {
    // biome-ignore lint/complexity/noVoid: We want to fire and forget this, we don't need to await it here
    void setLanguage(lang);
  };

  return {
    language,
    availableLanguages: AVAILABLE_LANGUAGES,
    setLanguage: handleSetLanguage,
  };
}
