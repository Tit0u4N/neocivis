// @ts-nocheck

'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/features/media-gallery/MediaGallery', () => ({
  MediaGallery: () => <div data-testid="media-gallery" />,
}));

const mockVm = {
  carousel: [],
  selectedId: '',
  selectedSlide: null,
  defaultLocale: 'fr',
  isLoading: false,
  isSaving: false,
  saveError: null,
  saveConfig: vi.fn(),
  setSelectedId: vi.fn(),
  addSlide: vi.fn(),
  removeSlide: vi.fn(),
  moveSlide: vi.fn(),
  updateSlide: vi.fn(),
  addLocaleToSelected: vi.fn(),
  removeLocaleFromSelected: vi.fn(),
  updateTranslation: vi.fn(),
  getSlideLink: vi.fn().mockReturnValue({ type: 'none', value: '' }),
  updateSlideLink: vi.fn(),
  isPickerOpen: false,
  openImagePicker: vi.fn(),
  closeImagePicker: vi.fn(),
  handleMediaSelect: vi.fn(),
};

vi.mock('./useCarouselTab', () => ({
  useCarouselTab: () => mockVm,
}));

import { CarouselTab } from './CarouselTab';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CarouselTab', () => {
  it('renders the slides section title', () => {
    render(<CarouselTab />);
    expect(screen.getByText('appManagement.carousel.slides')).toBeTruthy();
  });

  it('shows empty state when carousel is empty', () => {
    render(<CarouselTab />);
    expect(screen.getAllByText('appManagement.carousel.empty').length).toBeGreaterThan(0);
  });

  it('shows loading state while isLoading', () => {
    mockVm.isLoading = true;
    render(<CarouselTab />);
    expect(screen.getByText('appManagement.loading')).toBeTruthy();
    mockVm.isLoading = false;
  });

  it('calls addSlide when the add button is clicked', () => {
    render(<CarouselTab />);
    fireEvent.click(screen.getByText('appManagement.carousel.add'));
    expect(mockVm.addSlide).toHaveBeenCalled();
  });

  it('renders a slide item for each carousel entry', () => {
    mockVm.carousel = [
      { id: 's1', imageUrl: '', linkUrl: '', translations: [{ locale: 'fr', title: 'Slide Un' }] },
      { id: 's2', imageUrl: '', linkUrl: '', translations: [{ locale: 'fr', title: 'Slide Deux' }] },
    ];
    render(<CarouselTab />);
    expect(screen.getByText('Slide Un')).toBeTruthy();
    expect(screen.getByText('Slide Deux')).toBeTruthy();
    mockVm.carousel = [];
  });
});
