'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex flex-col gap-2">
        <span className="font-bold text-8xl text-primary tabular-nums">404</span>
        <h1 className="font-semibold text-foreground text-xl">{t('notFound.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('notFound.description')}</p>
      </div>
      <Button className="uppercase tracking-widest" render={<Link href="/dashboard" />} nativeButton={false}>
        {t('notFound.backToDashboard')}
      </Button>
    </div>
  );
}
