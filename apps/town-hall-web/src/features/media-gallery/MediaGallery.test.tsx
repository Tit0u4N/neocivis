// @ts-nocheck

'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const mockVm = {
  mediaList: [],
  filteredMedia: [],
  search: '',
  activeFilter: 'all',
  filterOptions: [{ value: 'all', label: 'Tous' }],
  linkTypeLabels: {},
  isLoading: false,
  isUploading: false,
  isUploadModalOpen: false,
  pendingFile: null,
  uploadTitle: '',
  deleteTarget: null,
  isDeleting: false,
  setSearch: vi.fn(),
  setActiveFilter: vi.fn(),
  selectMedia: vi.fn(),
  openUploadModal: vi.fn(),
  closeUploadModal: vi.fn(),
  setPendingFile: vi.fn(),
  setUploadTitle: vi.fn(),
  confirmUpload: vi.fn(),
  openDeleteDialog: vi.fn(),
  closeDeleteDialog: vi.fn(),
  confirmDelete: vi.fn(),
};

vi.mock('./useMediaGallery', () => ({
  useMediaGallery: () => mockVm,
}));

import { MediaGallery } from './MediaGallery';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeMedia(id: string, title: string) {
  return {
    id,
    title,
    url: `https://example.com/${id}.jpg`,
    storagePath: `/uploads/${id}.jpg`,
    mimeType: 'image/jpeg',
    size: 1024,
    createdAt: '2024-01-01T00:00:00Z',
    links: [],
  };
}

describe('MediaGallery', () => {
  it('renders in gallery mode without crashing', () => {
    render(<MediaGallery mode="gallery" />);
    expect(screen.getByPlaceholderText('media.gallery.searchPlaceholder')).toBeTruthy();
  });

  it('shows the upload button', () => {
    render(<MediaGallery mode="gallery" />);
    expect(screen.getByText('media.gallery.upload')).toBeTruthy();
  });

  it('calls openUploadModal when upload button is clicked', () => {
    render(<MediaGallery mode="gallery" />);
    fireEvent.click(screen.getByText('media.gallery.upload'));
    expect(mockVm.openUploadModal).toHaveBeenCalled();
  });

  it('calls setSearch when the search input changes', () => {
    render(<MediaGallery mode="gallery" />);
    const input = screen.getByPlaceholderText('media.gallery.searchPlaceholder');
    fireEvent.change(input, { target: { value: 'photo' } });
    expect(mockVm.setSearch).toHaveBeenCalledWith('photo');
  });

  it('shows empty state when no media', () => {
    render(<MediaGallery mode="gallery" />);
    expect(screen.getByText('media.gallery.noResults')).toBeTruthy();
  });

  it('shows loading skeletons while isLoading', () => {
    mockVm.isLoading = true;
    const { container } = render(<MediaGallery mode="gallery" />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    mockVm.isLoading = false;
  });

  it('renders media items when filteredMedia is populated', () => {
    mockVm.filteredMedia = [makeMedia('m1', 'Photo plage'), makeMedia('m2', 'Photo ville')];
    render(<MediaGallery mode="gallery" />);
    expect(screen.getByText('Photo plage')).toBeTruthy();
    expect(screen.getByText('Photo ville')).toBeTruthy();
    mockVm.filteredMedia = [];
  });

  it('shows the delete confirmation dialog when deleteTarget is set', () => {
    mockVm.deleteTarget = makeMedia('m1', 'Photo à supprimer');
    render(<MediaGallery mode="gallery" />);
    expect(screen.getByText('media.delete.title')).toBeTruthy();
    mockVm.deleteTarget = null;
  });
});
