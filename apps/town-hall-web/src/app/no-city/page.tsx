'use client';

import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNoCityPage } from './useNoCityPage';

export default function NoCityPage() {
  const { t } = useTranslation();
  const { handleLogout } = useNoCityPage();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-xl bg-muted">
        <Building2 className="size-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-foreground text-xl">{t('noCity.title')}</h1>
        <p className="max-w-md text-muted-foreground text-sm">{t('noCity.description')}</p>
      </div>
      <Button className="uppercase tracking-widest" onClick={handleLogout}>
        {t('noCity.logout')}
      </Button>
    </div>
  );
}
