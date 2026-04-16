'use client';

import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Language } from '@/hooks/useSettings';
import { useSettings } from '@/hooks/useSettings';
import type { Theme } from '@/stores/theme.store';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, theme, setTheme } = useSettings();

  return (
    <PageLayout title={t('nav.settings')}>
      <div className="max-w-2xl space-y-6">
        <section className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              {t('settings.appearance')}
            </h2>
          </div>

          <div className="divide-y">
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">{t('settings.language.label')}</p>
                <p className="text-muted-foreground text-xs">{t('settings.language.description')}</p>
              </div>
              <Select
                value={currentLanguage}
                onValueChange={(value) => {
                  void changeLanguage(value as Language);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t('settings.language.fr')}</SelectItem>
                  <SelectItem value="en">{t('settings.language.en')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">{t('settings.theme.label')}</p>
                <p className="text-muted-foreground text-xs">{t('settings.theme.description')}</p>
              </div>
              <Select
                value={theme}
                onValueChange={(value) => {
                  setTheme(value as Theme);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.theme.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.theme.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.theme.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
