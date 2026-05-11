'use client';

import type { CarouselItem, CarouselItemTranslation, ConfigLocale } from '@repo/contracts/config';
import { ConfigService } from '@repo/frontend-services/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';
import { type Locale, useConfigStore } from '@/stores/config.store';

export type CarouselTabViewModel = {
  carousel: CarouselItem[];
  selectedId: string;
  selectedSlide: CarouselItem | null;
  activeLang: Locale;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveConfig: () => Promise<void>;
  setSelectedId: (id: string) => void;
  setActiveLang: (locale: Locale) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, dir: 1 | -1) => void;
  updateSlide: (id: string, patch: Partial<CarouselItem>) => void;
  updateTranslation: (slideId: string, locale: string, field: 'title' | 'description' | 'tag', value: string) => void;
};

export function useCarouselTab(): CarouselTabViewModel {
  const { t } = useTranslation();
  const api = useApi();
  const cityId = useCityStore((s) => s.cityId);
  const configService = useMemo(() => new ConfigService(api, cityId), [api, cityId]);

  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeLang, setActiveLang] = useState<Locale>('fr');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const availableLocales = useConfigStore((s) => s.availableLocales);
  const defaultLocale = useConfigStore((s) => s.defaultLocale);

  const selectedSlide = carousel.find((s) => s.id === selectedId) ?? carousel[0] ?? null;

  useEffect(() => {
    configService
      .getMunicipalityConfig()
      .then((data) => {
        const items = data.carousel;
        setCarousel(items);
        if (items.length > 0) {
          setSelectedId(items[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [configService]);

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
    const newId = `slide-${Date.now()}`;
    const newSlide: CarouselItem = {
      id: newId,
      order: carousel.length,
      translations: availableLocales.map((locale) => ({ locale, title: '', description: '', tag: '' })),
    };
    setCarousel((prev) => [...prev, newSlide]);
    setSelectedId(newId);
    setActiveLang(defaultLocale);
  }, [availableLocales, carousel.length, defaultLocale]);

  const removeSlide = useCallback(
    (id: string) => {
      setCarousel((prev) => {
        const next = prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }));
        if (selectedId === id) {
          setSelectedId(next[0]?.id ?? '');
        }
        return next;
      });
    },
    [selectedId],
  );

  const moveSlide = useCallback((id: string, dir: 1 | -1) => {
    setCarousel((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[i], next[j]] = [next[j] as CarouselItem, next[i] as CarouselItem];
      return next.map((s, idx) => ({ ...s, order: idx }));
    });
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
          const hasLocale = s.translations.some((tr) => tr.locale === locale);
          const applyField = (tr: CarouselItemTranslation): CarouselItemTranslation => ({
            ...tr,
            title: field === 'title' ? value : tr.title,
            description: field === 'description' ? value : tr.description,
            tag: field === 'tag' ? value : tr.tag,
          });
          const translations: CarouselItemTranslation[] = hasLocale
            ? s.translations.map((tr) => (tr.locale === locale ? applyField(tr) : tr))
            : [...s.translations, applyField({ locale: locale as ConfigLocale, title: '', description: '', tag: '' })];
          return { ...s, translations };
        }),
      );
    },
    [],
  );

  return {
    carousel,
    selectedId: selectedSlide?.id ?? '',
    selectedSlide,
    activeLang,
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    setSelectedId,
    setActiveLang,
    addSlide,
    removeSlide,
    moveSlide,
    updateSlide,
    updateTranslation,
  };
}
