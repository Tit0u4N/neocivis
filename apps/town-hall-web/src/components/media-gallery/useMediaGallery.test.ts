'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockGetAll, mockUpload, mockDelete, mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockUpload: vi.fn(),
  mockDelete: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/providers/ApiProvider', () => {
  const stableApi = {};
  return { useApi: () => stableApi };
});

vi.mock('@/stores/city.store', () => ({
  useCityStore: (selector: (s: { cityId: string }) => unknown) =>
    selector({ cityId: 'test-city-id' }),
}));

vi.mock('@repo/frontend-services/media', () => ({
  // biome-ignore lint/style/useNamingConvention: mock class requires PascalCase
  MediaService: vi.fn(function () {
    return { getAll: mockGetAll, upload: mockUpload, delete: mockDelete };
  }),
}));

vi.mock('sonner', () => ({
  toast: { error: mockToastError, success: mockToastSuccess },
}));

import type { MediaImage } from '@repo/contracts/media';
import { useMediaGallery } from './useMediaGallery';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeMedia(
  id: string,
  opts: {
    title?: string;
    links?: { idLink: string; type: 'carousel' | 'articles' | 'establishments'; title: string }[];
  } = {},
): MediaImage {
  return {
    id,
    title: opts.title,
    url: `https://example.com/${id}.jpg`,
    storagePath: `/uploads/${id}.jpg`,
    cityId: '00000000-0000-0000-0000-000000000002',
    createdAt: '2026-01-01T00:00:00.000Z',
    links: opts.links ?? [],
  };
}

const media1 = makeMedia('00000000-0000-0000-0000-000000000001', {
  title: 'Photo de mairie',
  links: [{ idLink: '00000000-0000-0000-0000-000000000010', type: 'carousel', title: 'Slide 1' }],
});

const media2 = makeMedia('00000000-0000-0000-0000-000000000002', {
  title: 'Image article',
  links: [{ idLink: '00000000-0000-0000-0000-000000000011', type: 'articles', title: 'Article 1' }],
});

const media3 = makeMedia('00000000-0000-0000-0000-000000000003', {
  title: 'Non utilisée',
  links: [],
});

const MEDIA_LIST = [media1, media2, media3];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function setup(onSelect?: (m: MediaImage) => void, mediaList = MEDIA_LIST) {
  mockGetAll.mockResolvedValue(mediaList);
  const hook = renderHook(() => useMediaGallery({ onSelect }));
  await act(async () => {});
  return hook;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMediaGallery', () => {
  describe('initialization', () => {
    it('should start in loading state before fetch resolves', () => {
      mockGetAll.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMediaGallery({}));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.mediaList).toEqual([]);
    });

    it('should load media on mount and clear loading state', async () => {
      const { result } = await setup();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.mediaList).toEqual(MEDIA_LIST);
    });

    it('should show error toast and clear loading state when getAll fails', async () => {
      mockGetAll.mockRejectedValue(new Error('Network'));
      const hook = renderHook(() => useMediaGallery({}));
      await act(async () => {});

      expect(hook.result.current.isLoading).toBe(false);
      expect(mockToastError).toHaveBeenCalledWith('media.load.error', expect.objectContaining({}));
    });

    it('should include the API error description in the toast when available', async () => {
      const apiResponse = new Response(JSON.stringify({ error: 'Accès refusé' }), { status: 403 });
      const err = Object.assign(new Error('Forbidden'), { response: apiResponse });
      mockGetAll.mockRejectedValue(err);

      const hook = renderHook(() => useMediaGallery({}));
      await act(async () => {});

      expect(mockToastError).toHaveBeenCalledWith(
        'media.load.error',
        expect.objectContaining({ description: 'Accès refusé' }),
      );
    });
  });

  describe('filteredMedia', () => {
    it('should return all media when filter is "all" and no search query', async () => {
      const { result } = await setup();

      expect(result.current.filteredMedia).toHaveLength(3);
    });

    it('should filter by "unused" (media with no links)', async () => {
      const { result } = await setup();

      act(() => result.current.setActiveFilter('unused'));

      expect(result.current.filteredMedia).toHaveLength(1);
      expect(result.current.filteredMedia[0]?.id).toBe(media3.id);
    });

    it('should filter by link type "carousel"', async () => {
      const { result } = await setup();

      act(() => result.current.setActiveFilter('carousel'));

      expect(result.current.filteredMedia).toHaveLength(1);
      expect(result.current.filteredMedia[0]?.id).toBe(media1.id);
    });

    it('should filter by link type "articles"', async () => {
      const { result } = await setup();

      act(() => result.current.setActiveFilter('articles'));

      expect(result.current.filteredMedia).toHaveLength(1);
      expect(result.current.filteredMedia[0]?.id).toBe(media2.id);
    });

    it('should filter by link type "establishments" and return empty list', async () => {
      const { result } = await setup();

      act(() => result.current.setActiveFilter('establishments'));

      expect(result.current.filteredMedia).toHaveLength(0);
    });

    it('should filter by title search query (case-insensitive)', async () => {
      const { result } = await setup();

      act(() => result.current.setSearch('MAIRIE'));

      expect(result.current.filteredMedia).toHaveLength(1);
      expect(result.current.filteredMedia[0]?.id).toBe(media1.id);
    });

    it('should filter by link title in search query', async () => {
      const { result } = await setup();

      act(() => result.current.setSearch('Article 1'));

      expect(result.current.filteredMedia).toHaveLength(1);
      expect(result.current.filteredMedia[0]?.id).toBe(media2.id);
    });

    it('should apply search and type filter together', async () => {
      const { result } = await setup();

      act(() => {
        result.current.setActiveFilter('carousel');
        result.current.setSearch('mairie');
      });

      expect(result.current.filteredMedia).toHaveLength(1);
      expect(result.current.filteredMedia[0]?.id).toBe(media1.id);
    });

    it('should return empty list when search matches nothing', async () => {
      const { result } = await setup();

      act(() => result.current.setSearch('xxxxxxxxxxxxxx'));

      expect(result.current.filteredMedia).toHaveLength(0);
    });

    it('should ignore leading/trailing whitespace in search query', async () => {
      const { result } = await setup();

      act(() => result.current.setSearch('  mairie  '));

      expect(result.current.filteredMedia).toHaveLength(1);
    });
  });

  describe('selectMedia', () => {
    it('should call onSelect with the selected media', async () => {
      const onSelect = vi.fn();
      const { result } = await setup(onSelect);

      act(() => result.current.selectMedia(media1));

      expect(onSelect).toHaveBeenCalledWith(media1);
    });

    it('should not throw when no onSelect callback is provided', async () => {
      const { result } = await setup();

      expect(() => act(() => result.current.selectMedia(media1))).not.toThrow();
    });
  });

  describe('upload modal', () => {
    it('should open the upload modal', async () => {
      const { result } = await setup();

      act(() => result.current.openUploadModal());

      expect(result.current.isUploadModalOpen).toBe(true);
    });

    it('should close the upload modal and reset pendingFile and uploadTitle', async () => {
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.openUploadModal();
        result.current.setPendingFile(file);
        result.current.setUploadTitle('Mon titre');
      });
      act(() => result.current.closeUploadModal());

      expect(result.current.isUploadModalOpen).toBe(false);
      expect(result.current.pendingFile).toBeNull();
      expect(result.current.uploadTitle).toBe('');
    });
  });

  describe('confirmUpload', () => {
    it('should do nothing when pendingFile is null', async () => {
      const { result } = await setup();

      act(() => result.current.confirmUpload());

      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should call mediaService.upload and prepend the result to mediaList', async () => {
      const newMedia = makeMedia('00000000-0000-0000-0000-000000000099', { title: 'Nouveau' });
      mockUpload.mockResolvedValue(newMedia);
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      // confirmUpload captures pendingFile via useCallback closure — set state first, then confirm
      act(() => {
        result.current.setPendingFile(file);
        result.current.setUploadTitle('Mon titre');
      });
      act(() => result.current.confirmUpload());
      await waitFor(() => expect(result.current.isUploading).toBe(false));

      expect(mockUpload).toHaveBeenCalledWith(file, 'Mon titre');
      expect(result.current.mediaList[0]).toEqual(newMedia);
      expect(result.current.mediaList).toHaveLength(4);
      expect(mockToastSuccess).toHaveBeenCalledWith('media.upload.success');
    });

    it('should pass undefined as title when uploadTitle is empty', async () => {
      const newMedia = makeMedia('00000000-0000-0000-0000-000000000099');
      mockUpload.mockResolvedValue(newMedia);
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => result.current.setPendingFile(file));
      act(() => result.current.confirmUpload());
      await waitFor(() => expect(result.current.isUploading).toBe(false));

      expect(mockUpload).toHaveBeenCalledWith(file, undefined);
    });

    it('should pass undefined as title when uploadTitle is only whitespace', async () => {
      const newMedia = makeMedia('00000000-0000-0000-0000-000000000099');
      mockUpload.mockResolvedValue(newMedia);
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.setPendingFile(file);
        result.current.setUploadTitle('   ');
      });
      act(() => result.current.confirmUpload());
      await waitFor(() => expect(result.current.isUploading).toBe(false));

      expect(mockUpload).toHaveBeenCalledWith(file, undefined);
    });

    it('should close the modal immediately before the upload resolves', async () => {
      mockUpload.mockReturnValue(new Promise(() => {}));
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.openUploadModal();
        result.current.setPendingFile(file);
      });
      act(() => result.current.confirmUpload());

      expect(result.current.isUploadModalOpen).toBe(false);
    });

    it('should set isUploading to true while upload is pending', async () => {
      let resolveUpload!: (m: MediaImage) => void;
      mockUpload.mockReturnValue(new Promise<MediaImage>((res) => { resolveUpload = res; }));
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => result.current.setPendingFile(file));
      act(() => result.current.confirmUpload());

      expect(result.current.isUploading).toBe(true);

      const newMedia = makeMedia('00000000-0000-0000-0000-000000000099');
      await act(async () => { resolveUpload(newMedia); });

      expect(result.current.isUploading).toBe(false);
    });

    it('should show error toast when upload fails', async () => {
      mockUpload.mockRejectedValue(new Error('Upload failed'));
      const { result } = await setup();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => result.current.setPendingFile(file));
      act(() => result.current.confirmUpload());
      await waitFor(() => expect(result.current.isUploading).toBe(false));

      expect(mockToastError).toHaveBeenCalledWith('media.upload.error', expect.objectContaining({}));
    });
  });

  describe('delete dialog', () => {
    it('should open the delete dialog and set deleteTarget', async () => {
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media1));

      expect(result.current.deleteTarget).toEqual(media1);
    });

    it('should close the delete dialog and clear deleteTarget', async () => {
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media1));
      act(() => result.current.closeDeleteDialog());

      expect(result.current.deleteTarget).toBeNull();
    });
  });

  describe('confirmDelete', () => {
    it('should do nothing when deleteTarget is null', async () => {
      const { result } = await setup();

      act(() => result.current.confirmDelete());

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should call mediaService.delete and remove the media from the list', async () => {
      mockDelete.mockResolvedValue(undefined);
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media1));
      act(() => result.current.confirmDelete());
      await waitFor(() => expect(result.current.isDeleting).toBe(false));

      expect(mockDelete).toHaveBeenCalledWith(media1.id);
      expect(result.current.mediaList.some((m) => m.id === media1.id)).toBe(false);
      expect(result.current.mediaList).toHaveLength(2);
      expect(mockToastSuccess).toHaveBeenCalledWith('media.delete.success');
    });

    it('should close the dialog immediately before delete resolves', async () => {
      mockDelete.mockReturnValue(new Promise(() => {}));
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media1));
      act(() => result.current.confirmDelete());

      expect(result.current.deleteTarget).toBeNull();
    });

    it('should set isDeleting to true while delete is pending', async () => {
      let resolveDelete!: () => void;
      mockDelete.mockReturnValue(new Promise<void>((res) => { resolveDelete = res; }));
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media1));
      act(() => result.current.confirmDelete());

      expect(result.current.isDeleting).toBe(true);

      await act(async () => { resolveDelete(); });

      expect(result.current.isDeleting).toBe(false);
    });

    it('should show error toast when delete fails', async () => {
      mockDelete.mockRejectedValue(new Error('Forbidden'));
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media1));
      act(() => result.current.confirmDelete());
      await waitFor(() => expect(result.current.isDeleting).toBe(false));

      expect(mockToastError).toHaveBeenCalledWith('media.delete.error', expect.objectContaining({}));
    });

    it('should not remove other media when one is deleted', async () => {
      mockDelete.mockResolvedValue(undefined);
      const { result } = await setup();

      act(() => result.current.openDeleteDialog(media2));
      act(() => result.current.confirmDelete());
      await waitFor(() => expect(result.current.isDeleting).toBe(false));

      expect(result.current.mediaList.some((m) => m.id === media1.id)).toBe(true);
      expect(result.current.mediaList.some((m) => m.id === media3.id)).toBe(true);
    });
  });

  describe('filterOptions', () => {
    it('should include "all", all link types, and "unused" options', async () => {
      const { result } = await setup();
      const ids = result.current.filterOptions.map((o) => o.id);

      expect(ids).toContain('all');
      expect(ids).toContain('carousel');
      expect(ids).toContain('articles');
      expect(ids).toContain('establishments');
      expect(ids).toContain('unused');
    });

    it('should have "all" as the first option', async () => {
      const { result } = await setup();

      expect(result.current.filterOptions[0]?.id).toBe('all');
    });

    it('should have "unused" as the last option', async () => {
      const { result } = await setup();
      const last = result.current.filterOptions.at(-1);

      expect(last?.id).toBe('unused');
    });

    it('should assign translated labels to each option', async () => {
      const { result } = await setup();

      for (const option of result.current.filterOptions) {
        expect(typeof option.label).toBe('string');
        expect(option.label.length).toBeGreaterThan(0);
      }
    });
  });
});
