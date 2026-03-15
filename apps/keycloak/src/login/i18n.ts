import { i18nBuilder } from 'keycloakify/login/i18n';

type ThemeName = 'citizen' | 'town-hall';

const { useI18n, ofTypeI18n } = i18nBuilder
  .withThemeName<ThemeName>()
  .withCustomTranslations({
    fr: {
      'app-name-citizen': 'NeoCivis Citoyen',
      'app-name-town-hall': 'NeoCivis Mairie',
      'app-tagline-citizen': 'Accédez à vos services municipaux',
      'app-tagline-town-hall': 'Portail de gestion municipale',
      'welcome-back': 'Bon retour',
      'new-account': 'Créer un compte',
    },
    en: {
      'app-name-citizen': 'NeoCivis Citizen',
      'app-name-town-hall': 'NeoCivis Town Hall',
      'app-tagline-citizen': 'Access your municipal services',
      'app-tagline-town-hall': 'Municipal management portal',
      'welcome-back': 'Welcome back',
      'new-account': 'Create account',
    },
  })
  .build();

export { useI18n };
export type I18n = typeof ofTypeI18n;
