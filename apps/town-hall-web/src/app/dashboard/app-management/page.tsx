'use client';

import { useTranslation } from 'react-i18next';
import { CarouselTab } from '@/components/app-management/carousel/CarouselTab';
import { CategoryLayoutTab } from '@/components/app-management/category/CategoryLayoutTab';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AppManagementRoute() {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('appManagement.title')} className={'flex-col'}>
      <Tabs className="flex-col gap-3 pt-3">
        <TabsList className="h-8 w-full text-xl">
          <TabsTrigger value="layout">{t('appManagement.tabs.layout')}</TabsTrigger>
          <TabsTrigger value="carousel">{t('appManagement.tabs.carousel')}</TabsTrigger>
        </TabsList>

        <TabsContent value="layout">
          <CategoryLayoutTab />
        </TabsContent>

        <TabsContent value="carousel">
          <CarouselTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
