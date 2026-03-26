import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { i18n } from '@/i18n';

const LANGUAGE_KEY = '@neocivis/language';

export const AVAILABLE_LANGUAGES = ['fr', 'en'] as const;
export type Language = (typeof AVAILABLE_LANGUAGES)[number];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const loadSavedLanguage = async () => {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && (AVAILABLE_LANGUAGES as readonly string[]).includes(saved)) {
        const lang = saved as Language;
        setLanguageState(lang);
        await i18n.changeLanguage(lang);
      }
    };

    // biome-ignore lint/complexity/noVoid: We don't care about awaiting this, we just want to load the language on startup
    void loadSavedLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage doit être utilisé à l'intérieur d'un LanguageProvider");
  }
  return context;
}
