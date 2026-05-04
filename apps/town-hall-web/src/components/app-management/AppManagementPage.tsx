'use client';

import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarouselTab } from './CarouselTab';
import { CategoryLayoutTab } from './CategoryLayoutTab';
import type { CarouselTabViewModel } from './useCarouselTab';
import type { CategoryLayoutTabViewModel } from './useCategoryLayoutTab';

type Props = {
  categoryVm: CategoryLayoutTabViewModel;
  carouselVm: CarouselTabViewModel;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveConfig: () => Promise<void>;
};

export function AppManagementPage({ categoryVm, carouselVm, isLoading, isSaving, saveError, saveConfig }: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <PageLayout title={t('appManagement.title')}>
        <p className="text-muted-foreground text-sm">{t('appManagement.loading')}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('appManagement.title')} className={'flex-col'}>
      <Tabs className="flex-col">
        <TabsList className="mb-6 h-8 w-full text-xl">
          <TabsTrigger value="layout">{t('appManagement.tabs.layout')}</TabsTrigger>
          <TabsTrigger value="carousel">{t('appManagement.tabs.carousel')}</TabsTrigger>
        </TabsList>

        <TabsContent value="layout">
          <CategoryLayoutTab vm={categoryVm} isSaving={isSaving} saveError={saveError} saveConfig={saveConfig} />
        </TabsContent>

        <TabsContent value="carousel">
          <CarouselTab vm={carouselVm} isSaving={isSaving} saveError={saveError} saveConfig={saveConfig} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
