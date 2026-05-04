'use client';

import { ConfigService } from '@repo/frontend-services/config';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppManagementPage } from '@/components/app-management/AppManagementPage';
import { useCarouselTab } from '@/components/app-management/useCarouselTab';
import { categoryToTile, tileToCategory, useCategoryLayoutTab } from '@/components/app-management/useCategoryLayoutTab';
import { useApi } from '@/providers/ApiProvider';

export default function AppManagementRoute() {
  const { t } = useTranslation();
  const api = useApi();
  const configService = new ConfigService(api);
  const categoryVm = useCategoryLayoutTab();
  const carouselVm = useCarouselTab();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    configService
      .getMunicipalityConfig()
      .then((data) => {
        categoryVm.resetToData(data.categories.map(categoryToTile));
        carouselVm.resetCarousel(data.carousel);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselVm.resetCarousel, categoryVm.resetToData, configService.getMunicipalityConfig]);

  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await Promise.all([
        configService.setCategories(categoryVm.blocks.map(tileToCategory)),
        configService.setCarouselItems(carouselVm.carousel),
      ]);
    } catch {
      setSaveError(t('appManagement.saveError'));
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryVm.blocks, carouselVm.carousel, t, configService.setCarouselItems, configService.setCategories]);

  return (
    <AppManagementPage
      categoryVm={categoryVm}
      carouselVm={carouselVm}
      isLoading={isLoading}
      isSaving={isSaving}
      saveError={saveError}
      saveConfig={saveConfig}
    />
  );
}
