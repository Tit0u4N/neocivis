'use client';

import type { CarouselItem, CarouselItemTranslation, ConfigLocale } from '@repo/contracts/config';
import type { MediaImage } from '@repo/contracts/media';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '@/providers/ServicesProvider';
import { type Locale, useConfigStore } from '@/stores/config.store';
import { type LinkValue, linkValueToUrl, urlToLinkValue } from '../LinkPicker';

//TODO : REVIEW THE LINK WITH THE BQCKEND WHEN THE MEDIA GALLERY IS READY

export type CarouselTabViewModel = {
  carousel: CarouselItem[];
  selectedId: string;
  selectedSlide: CarouselItem | null;
  defaultLocale: Locale;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveConfig: () => Promise<void>;
  setSelectedId: (id: string) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, dir: 1 | -1) => void;
  updateSlide: (id: string, patch: Partial<CarouselItem>) => void;
  addLocaleToSelected: (locale: Locale) => void;
  removeLocaleFromSelected: (locale: Locale) => void;
  updateTranslation: (slideId: string, locale: string, field: 'title' | 'description' | 'tag', value: string) => void;
  getSlideLink: (slide: CarouselItem) => LinkValue;
  updateSlideLink: (slideId: string, link: LinkValue) => void;
  isPickerOpen: boolean;
  openImagePicker: () => void;
  closeImagePicker: () => void;
  handleMediaSelect: (media: MediaImage) => void;
};

export function useCarouselTab(): CarouselTabViewModel {
  const { t } = useTranslation();
  const { configService } = useServices();

  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
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
  }, [availableLocales, carousel.length]);

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

  const addLocaleToSelected = useCallback(
    (locale: Locale) => {
      setCarousel((prev) =>
        prev.map((s) =>
          s.id === selectedSlide?.id && !s.translations.some((tr) => tr.locale === locale)
            ? { ...s, translations: [...s.translations, { locale, title: '', description: '', tag: '' }] }
            : s,
        ),
      );
    },
    [selectedSlide?.id],
  );

  const removeLocaleFromSelected = useCallback(
    (locale: Locale) => {
      if (locale === defaultLocale) {
        return;
      }
      setCarousel((prev) =>
        prev.map((s) =>
          s.id === selectedSlide?.id ? { ...s, translations: s.translations.filter((tr) => tr.locale !== locale) } : s,
        ),
      );
    },
    [selectedSlide?.id, defaultLocale],
  );

  const updateTranslation = useCallback(
    (slideId: string, locale: string, field: 'title' | 'description' | 'tag', value: string) => {
      setCarousel((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) {
            return s;
          }
          const applyField = (tr: CarouselItemTranslation): CarouselItemTranslation => ({
            ...tr,
            title: field === 'title' ? value : tr.title,
            description: field === 'description' ? value : tr.description,
            tag: field === 'tag' ? value : tr.tag,
          });
          const hasLocale = s.translations.some((tr) => tr.locale === locale);
          const translations: CarouselItemTranslation[] = hasLocale
            ? s.translations.map((tr) => (tr.locale === locale ? applyField(tr) : tr))
            : [...s.translations, applyField({ locale: locale as ConfigLocale, title: '', description: '', tag: '' })];
          return { ...s, translations };
        }),
      );
    },
    [],
  );

  const openImagePicker = useCallback(() => setIsPickerOpen(true), []);
  const closeImagePicker = useCallback(() => setIsPickerOpen(false), []);

  const handleMediaSelect = useCallback(
    (media: MediaImage) => {
      if (selectedSlide) {
        updateSlide(selectedSlide.id, { imageUrl: media.url });
      }
      setIsPickerOpen(false);
    },
    [selectedSlide, updateSlide],
  );

  const getSlideLink = useCallback((slide: CarouselItem): LinkValue => urlToLinkValue(slide.linkUrl), []);

  const updateSlideLink = useCallback(
    (slideId: string, link: LinkValue) => {
      updateSlide(slideId, { linkUrl: linkValueToUrl(link) });
    },
    [updateSlide],
  );

  return {
    carousel,
    selectedId: selectedSlide?.id ?? '',
    selectedSlide,
    defaultLocale,
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    setSelectedId,
    addSlide,
    removeSlide,
    moveSlide,
    updateSlide,
    addLocaleToSelected,
    removeLocaleFromSelected,
    updateTranslation,
    getSlideLink,
    updateSlideLink,
    isPickerOpen,
    openImagePicker,
    closeImagePicker,
    handleMediaSelect,
  };
}
