'use client';

import type { CarouselItem } from '@repo/contracts/config';
import { useCallback, useState } from 'react';
import { useConfigStore } from '@/stores/config.store';

export type CarouselTabViewModel = {
  carousel: CarouselItem[];
  resetCarousel: (items: CarouselItem[]) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, patch: Partial<CarouselItem>) => void;
  updateTranslation: (slideId: string, locale: string, field: 'title' | 'description' | 'tag', value: string) => void;
};

export function useCarouselTab(): CarouselTabViewModel {
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const availableLocales = useConfigStore((s) => s.availableLocales);

  const resetCarousel = useCallback((items: CarouselItem[]) => {
    setCarousel(items);
  }, []);

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

  return { carousel, resetCarousel, addSlide, removeSlide, updateSlide, updateTranslation };
}
