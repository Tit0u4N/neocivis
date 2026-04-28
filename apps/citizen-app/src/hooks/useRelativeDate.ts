import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageContext';

export function useRelativeDate() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (dateStr: string): string => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);

    if (diffH < 1) {
      return t('common.relativeDate.justNow');
    }
    if (diffH < 24) {
      return t('common.relativeDate.hoursAgo', { count: diffH });
    }
    if (diffD === 1) {
      return t('common.relativeDate.yesterday');
    }
    if (diffD < 7) {
      return t('common.relativeDate.daysAgo', { count: diffD });
    }
    return new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short' }).format(date);
  };
}
