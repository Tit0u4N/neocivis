import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CarouselItem } from '@repo/contracts/config';
import type { MediaImage } from '@repo/contracts/media';

import { useCarouselTab } from './useCarouselTab';

const { mockGetMunicipalityConfig, mockSetCarouselItems } = vi.hoisted(() => ({
  mockGetMunicipalityConfig: vi.fn(),
  mockSetCarouselItems: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/stores/config.store', () => ({
  useConfigStore: (selector: (s: { availableLocales: string[]; defaultLocale: string }) => unknown) =>
    selector({ availableLocales: ['fr', 'en'], defaultLocale: 'fr' }),
}));

const mockConfigService = {
  getMunicipalityConfig: mockGetMunicipalityConfig,
  setCarouselItems: mockSetCarouselItems,
}
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ configService: mockConfigService }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const slide1: CarouselItem = {
  id: 'slide-1',
  order: 0,
  translations: [{ locale: 'fr', title: 'Titre 1' }],
};

const slide2: CarouselItem = {
  id: 'slide-2',
  order: 1,
  translations: [{ locale: 'fr', title: 'Titre 2' }],
};

const mockMedia: MediaImage = {
  id: '00000000-0000-0000-0000-000000000001',
  url: 'https://example.com/photo.jpg',
  storagePath: '/uploads/photo.jpg',
  cityId: '00000000-0000-0000-0000-000000000002',
  createdAt: '2026-01-01T00:00:00.000Z',
  links: [],
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

// Renders the hook and flushes all pending promise callbacks + state updates
// inside a single act() boundary, eliminating the "not wrapped in act" warning.
async function setup(carousel: CarouselItem[] = []) {
  mockGetMunicipalityConfig.mockResolvedValue({ carousel, categories: [] });
  const hook = renderHook(() => useCarouselTab());
  await act(async () => {});
  return hook;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCarouselTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start in loading state before the fetch resolves', () => {
      mockGetMunicipalityConfig.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useCarouselTab());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.carousel).toEqual([]);
      expect(result.current.selectedSlide).toBeNull();
    });

    it('should load carousel items on mount', async () => {
      const { result } = await setup([slide1, slide2]);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.carousel).toEqual([slide1, slide2]);
      expect(result.current.selectedId).toBe('slide-1');
      expect(result.current.selectedSlide).toEqual(slide1);
    });

    it('should handle an empty carousel', async () => {
      const { result } = await setup([]);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.carousel).toEqual([]);
      expect(result.current.selectedId).toBe('');
      expect(result.current.selectedSlide).toBeNull();
    });

    it('should handle a load error gracefully and stop loading', async () => {
      mockGetMunicipalityConfig.mockRejectedValue(new Error('Network error'));
      const hook = renderHook(() => useCarouselTab());
      await act(async () => {});

      expect(hook.result.current.isLoading).toBe(false);
      expect(hook.result.current.carousel).toEqual([]);
    });
  });

  describe('addSlide', () => {
    it('should add a new slide with translations for all available locales', async () => {
      const { result } = await setup([]);

      act(() => {
        result.current.addSlide();
      });

      expect(result.current.carousel).toHaveLength(1);
      const newSlide = result.current.carousel[0];
      expect(newSlide?.id).toMatch(/^slide-\d+$/);
      expect(newSlide?.order).toBe(0);
      expect(newSlide?.translations).toHaveLength(2);
      expect(newSlide?.translations[0]?.locale).toBe('fr');
      expect(newSlide?.translations[1]?.locale).toBe('en');
    });

    it('should select the newly added slide', async () => {
      const { result } = await setup([]);

      act(() => {
        result.current.addSlide();
      });

      expect(result.current.selectedId).toBe(result.current.carousel[0]?.id);
    });

    it('should assign the correct order when slides already exist', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.addSlide();
      });

      expect(result.current.carousel[2]?.order).toBe(2);
    });
  });

  describe('removeSlide', () => {
    it('should remove the specified slide', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.removeSlide('slide-2');
      });

      expect(result.current.carousel).toHaveLength(1);
      expect(result.current.carousel[0]?.id).toBe('slide-1');
    });

    it('should select the first remaining slide when the selected slide is removed', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.removeSlide('slide-1');
      });

      expect(result.current.selectedId).toBe('slide-2');
    });

    it('should reorder the remaining slides starting from 0', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.removeSlide('slide-1');
      });

      expect(result.current.carousel[0]?.order).toBe(0);
    });
  });

  describe('moveSlide', () => {
    it('should move a slide forward (dir=1)', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.moveSlide('slide-1', 1);
      });

      expect(result.current.carousel[0]?.id).toBe('slide-2');
      expect(result.current.carousel[1]?.id).toBe('slide-1');
    });

    it('should move a slide backward (dir=-1)', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.moveSlide('slide-2', -1);
      });

      expect(result.current.carousel[0]?.id).toBe('slide-2');
      expect(result.current.carousel[1]?.id).toBe('slide-1');
    });

    it('should not move a slide past the beginning', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.moveSlide('slide-1', -1);
      });

      expect(result.current.carousel[0]?.id).toBe('slide-1');
    });

    it('should not move a slide past the end', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.moveSlide('slide-2', 1);
      });

      expect(result.current.carousel[1]?.id).toBe('slide-2');
    });

    it('should update order values after moving', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.moveSlide('slide-1', 1);
      });

      expect(result.current.carousel[0]?.order).toBe(0);
      expect(result.current.carousel[1]?.order).toBe(1);
    });
  });

  describe('updateSlide', () => {
    it('should patch the specified slide', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.updateSlide('slide-1', { imageUrl: 'https://example.com/image.jpg' });
      });

      expect(result.current.carousel[0]?.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should not affect other slides', async () => {
      const { result } = await setup([slide1, slide2]);

      act(() => {
        result.current.updateSlide('slide-1', { imageUrl: 'https://example.com/image.jpg' });
      });

      expect(result.current.carousel[1]?.imageUrl).toBeUndefined();
    });
  });

  describe('addLocaleToSelected', () => {
    it('should add a new locale translation to the selected slide', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.addLocaleToSelected('en');
      });

      expect(result.current.carousel[0]?.translations).toHaveLength(2);
      expect(result.current.carousel[0]?.translations[1]?.locale).toBe('en');
    });

    it('should not add a duplicate locale', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.addLocaleToSelected('fr');
      });

      expect(result.current.carousel[0]?.translations).toHaveLength(1);
    });
  });

  describe('removeLocaleFromSelected', () => {
    const slideWithTwoLocales: CarouselItem = {
      id: 'slide-multi',
      order: 0,
      translations: [
        { locale: 'fr', title: 'Titre FR' },
        { locale: 'en', title: 'Title EN' },
      ],
    };

    it('should remove a non-default locale from the selected slide', async () => {
      const { result } = await setup([slideWithTwoLocales]);

      act(() => {
        result.current.removeLocaleFromSelected('en');
      });

      expect(result.current.carousel[0]?.translations).toHaveLength(1);
      expect(result.current.carousel[0]?.translations[0]?.locale).toBe('fr');
    });

    it('should not remove the default locale', async () => {
      const { result } = await setup([slideWithTwoLocales]);

      act(() => {
        result.current.removeLocaleFromSelected('fr');
      });

      expect(result.current.carousel[0]?.translations).toHaveLength(2);
    });
  });

  describe('updateTranslation', () => {
    it('should update the title of an existing translation', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.updateTranslation('slide-1', 'fr', 'title', 'Nouveau Titre');
      });

      expect(result.current.carousel[0]?.translations[0]?.title).toBe('Nouveau Titre');
    });

    it('should update the description of an existing translation', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.updateTranslation('slide-1', 'fr', 'description', 'Nouvelle description');
      });

      expect(result.current.carousel[0]?.translations[0]?.description).toBe('Nouvelle description');
    });

    it('should update the tag of an existing translation', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.updateTranslation('slide-1', 'fr', 'tag', 'nouveau-tag');
      });

      expect(result.current.carousel[0]?.translations[0]?.tag).toBe('nouveau-tag');
    });

    it('should create a new translation entry if the locale does not exist', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.updateTranslation('slide-1', 'en', 'title', 'English Title');
      });

      const translations = result.current.carousel[0]?.translations ?? [];
      expect(translations).toHaveLength(2);
      expect(translations.find((tr) => tr.locale === 'en')?.title).toBe('English Title');
    });
  });

  describe('getSlideLink / updateSlideLink', () => {
    it('should return type "General" for a slide with no linkUrl', async () => {
      const { result } = await setup([slide1]);

      expect(result.current.getSlideLink(slide1).type).toBe('General');
    });

    it('should return the corresponding type for a known linkUrl', async () => {
      const slideWithLink: CarouselItem = { ...slide1, linkUrl: 'Forum' };
      const { result } = await setup([slideWithLink]);

      expect(result.current.getSlideLink(slideWithLink).type).toBe('Forum');
    });

    it('should return "ExternalURL" type with the URL as value for an unknown linkUrl', async () => {
      const slideWithExternalLink: CarouselItem = { ...slide1, linkUrl: 'https://external.com' };
      const { result } = await setup([slideWithExternalLink]);

      const link = result.current.getSlideLink(slideWithExternalLink);
      expect(link.type).toBe('ExternalURL');
      expect(link.value).toBe('https://external.com');
    });

    it('should update the slide linkUrl from a LinkValue', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.updateSlideLink('slide-1', { type: 'Forum' });
      });

      expect(result.current.carousel[0]?.linkUrl).toBe('Forum');
    });

    it('should set linkUrl to undefined for the "Link" type', async () => {
      const slideWithLink: CarouselItem = { ...slide1, linkUrl: 'Forum' };
      const { result } = await setup([slideWithLink]);

      act(() => {
        result.current.updateSlideLink('slide-1', { type: 'General' });
      });

      expect(result.current.carousel[0]?.linkUrl).toBeUndefined();
    });
  });

  describe('image picker', () => {
    it('should open the image picker', async () => {
      const { result } = await setup([]);

      act(() => {
        result.current.openImagePicker();
      });

      expect(result.current.isPickerOpen).toBe(true);
    });

    it('should close the image picker', async () => {
      const { result } = await setup([]);

      act(() => {
        result.current.openImagePicker();
      });
      act(() => {
        result.current.closeImagePicker();
      });

      expect(result.current.isPickerOpen).toBe(false);
    });

    it('should update the selected slide imageUrl and close the picker on media select', async () => {
      const { result } = await setup([slide1]);

      act(() => {
        result.current.openImagePicker();
        result.current.handleMediaSelect(mockMedia);
      });

      expect(result.current.carousel[0]?.imageUrl).toBe('https://example.com/photo.jpg');
      expect(result.current.isPickerOpen).toBe(false);
    });

    it('should close the picker even when no slide is selected', async () => {
      const { result } = await setup([]);

      act(() => {
        result.current.openImagePicker();
        result.current.handleMediaSelect(mockMedia);
      });

      expect(result.current.isPickerOpen).toBe(false);
    });
  });

  describe('saveConfig', () => {
    it('should call setCarouselItems with the current carousel', async () => {
      mockSetCarouselItems.mockResolvedValue([slide1]);
      const { result } = await setup([slide1]);

      await act(async () => {
        await result.current.saveConfig();
      });

      expect(mockSetCarouselItems).toHaveBeenCalledWith([slide1]);
    });

    it('should clear saveError and set isSaving to false after a successful save', async () => {
      mockSetCarouselItems.mockResolvedValue([slide1]);
      const { result } = await setup([slide1]);

      await act(async () => {
        await result.current.saveConfig();
      });

      expect(result.current.saveError).toBeNull();
      expect(result.current.isSaving).toBe(false);
    });

    it('should set saveError on failure', async () => {
      mockSetCarouselItems.mockRejectedValue(new Error('Save failed'));
      const { result } = await setup([slide1]);

      await act(async () => {
        await result.current.saveConfig();
      });

      expect(result.current.saveError).toBe('appManagement.saveError');
      expect(result.current.isSaving).toBe(false);
    });

    it('should set isSaving to true while the save is pending', async () => {
      let resolveSave!: (value: CarouselItem[]) => void;
      mockSetCarouselItems.mockReturnValue(new Promise<CarouselItem[]>((res) => { resolveSave = res; }));
      const { result } = await setup([slide1]);

      act(() => {
        void result.current.saveConfig();
      });

      expect(result.current.isSaving).toBe(true);

      // biome-ignore lint/suspicious/useAwait: TEST
      await act(async () => {
        resolveSave([slide1]);
      });

      expect(result.current.isSaving).toBe(false);
    });
  });
});
