'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/ui/page-layout';
import { cn } from '@/lib/utils';

type AppTab = 'layout' | 'carousel';

import { CarouselTab } from '../../../features/app-management/carousel/CarouselTab';
import { CategoryLayoutTab } from '../../../features/app-management/category/CategoryLayoutTab';

export default function AppManagementRoute() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AppTab>('layout');

  const TABS: { id: AppTab; label: string }[] = [
    { id: 'layout', label: t('appManagement.tabs.layout') },
    { id: 'carousel', label: t('appManagement.tabs.carousel') },
  ];

  return (
    <PageLayout title={t('appManagement.title')} className={'flex-col'}>
      <div className="flex border-border border-b">
        {TABS.map((t_) => (
          <button
            key={t_.id}
            type="button"
            onClick={() => setTab(t_.id)}
            className={cn(
              '-mb-px border-b-2 px-5 py-2 font-medium text-sm transition-colors',
              tab === t_.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t_.label}
          </button>
        ))}
      </div>

      {tab === 'layout' ? <CategoryLayoutTab /> : <CarouselTab />}
    </PageLayout>
  );
}
