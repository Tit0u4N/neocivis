'use client';

import type { CarouselItem } from '@repo/contracts/config';
import { ConfigService } from '@repo/frontend-services/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';
import { useConfigStore } from '@/stores/config.store';

export type CarouselTabViewModel = {
  carousel: CarouselItem[];
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveConfig: () => Promise<void>;
  resetCarousel: (items: CarouselItem[]) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, patch: Partial<CarouselItem>) => void;
  updateTranslation: (slideId: string, locale: string, field: 'title' | 'description' | 'tag', value: string) => void;
};

export function useCarouselTab(): CarouselTabViewModel {
  const { t } = useTranslation();
  const api = useApi();
  const cityId = useCityStore((s) => s.cityId);
  const configService = useMemo(() => new ConfigService(api, cityId), [api, cityId]);

  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const availableLocales = useConfigStore((s) => s.availableLocales);

  const resetCarousel = useCallback((items: CarouselItem[]) => {
    setCarousel(items);
  }, []);

  useEffect(() => {
    configService
      .getMunicipalityConfig()
      .then((data) => resetCarousel(data.carousel))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [configService, resetCarousel]);

  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await configService.setCarouselItems(carousel);
    } catch {
      setSaveError(t('appManagement.saveError'));
    } finally {
      setIsSaving(false);
    }
  }, [carousel, configService, t]);

  const addSlide = useCallback(() => {
    setCarousel((prev) => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        order: prev.length,
        translations: availableLocales.map((locale) => ({ locale, title: '', description: '', tag: '' })),
      },
    ]);
  }, [availableLocales]);

  const removeSlide = useCallback((id: string) => {
    setCarousel((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
  }, []);

  const updateSlide = useCallback((id: string, patch: Partial<CarouselItem>) => {
    setCarousel((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const updateTranslation = useCallback(
    (slideId: string, locale: string, field: 'title' | 'description' | 'tag', value: string) => {
      setCarousel((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) {
            return s;
          }
          return {
            ...s,
            translations: s.translations.map((tr) => (tr.locale === locale ? { ...tr, [field]: value } : tr)),
          };
        }),
      );
    },
    [],
  );

  return {
    carousel,
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    resetCarousel,
    addSlide,
    removeSlide,
    updateSlide,
    updateTranslation,
  };
}
