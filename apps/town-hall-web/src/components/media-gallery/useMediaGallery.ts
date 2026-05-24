'use client';

import type { MediaImage, MediaImageLinkType } from '@repo/contracts/media';
import { MediaImageLinkType as MediaImageLinkTypeSchema } from '@repo/contracts/media';
import { MediaService } from '@repo/frontend-services/media';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

export type MediaFilter = 'all' | MediaImageLinkType | 'unused';

export type MediaFilterOption = {
  id: MediaFilter;
  label: string;
};

export type UseMediaGalleryProps = {
  onSelect?: (media: MediaImage) => void;
};

export type MediaGalleryViewModel = {
  mediaList: MediaImage[];
  filteredMedia: MediaImage[];
  search: string;
  activeFilter: MediaFilter;
  filterOptions: MediaFilterOption[];
  linkTypeLabels: Record<MediaImageLinkType, string>;
  isLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;
  isUploadModalOpen: boolean;
  pendingFile: File | null;
  uploadTitle: string;
  deleteTarget: MediaImage | null;
  isDeleting: boolean;
  deleteError: string | null;
  setSearch: (s: string) => void;
  setActiveFilter: (f: MediaFilter) => void;
  selectMedia: (media: MediaImage) => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  setPendingFile: (f: File | null) => void;
  setUploadTitle: (t: string) => void;
  confirmUpload: () => void;
  openDeleteDialog: (media: MediaImage) => void;
  closeDeleteDialog: () => void;
  confirmDelete: () => void;
};

export function useMediaGallery({ onSelect }: UseMediaGalleryProps): MediaGalleryViewModel {
  const { t } = useTranslation();
  const api = useApi();
  const cityId = useCityStore((s) => s.cityId);
  const mediaService = useMemo(() => new MediaService(api, cityId), [api, cityId]);

  const [mediaList, setMediaList] = useState<MediaImage[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MediaImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    mediaService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setMediaList(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mediaService]);

  const linkTypeLabels = useMemo<Record<MediaImageLinkType, string>>(
    () => ({
      carousel: t('media.linkTypes.carousel'),
      articles: t('media.linkTypes.articles'),
      establishments: t('media.linkTypes.establishments'),
    }),
    [t],
  );

  const filterOptions = useMemo<MediaFilterOption[]>(
    () => [
      { id: 'all', label: t('media.filters.all') },
      ...MediaImageLinkTypeSchema.options.map((type) => ({
        id: type as MediaFilter,
        label: linkTypeLabels[type],
      })),
      { id: 'unused', label: t('media.filters.unused') },
    ],
    [t, linkTypeLabels],
  );

  const filteredMedia = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mediaList.filter((m) => {
      if (q) {
        const inTitle = m.title?.toLowerCase().includes(q) ?? false;
        const inLinks = m.links.some((l) => l.title.toLowerCase().includes(q));
        if (!(inTitle || inLinks)) {
          return false;
        }
      }
      if (activeFilter === 'all') {
        return true;
      }
      if (activeFilter === 'unused') {
        return m.links.length === 0;
      }
      return m.links.some((l) => l.type === activeFilter);
    });
  }, [mediaList, search, activeFilter]);

  const selectMedia = useCallback(
    (media: MediaImage) => {
      onSelect?.(media);
    },
    [onSelect],
  );

  const openUploadModal = useCallback(() => setIsUploadModalOpen(true), []);

  const closeUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setPendingFile(null);
    setUploadTitle('');
  }, []);

  const confirmUpload = useCallback(() => {
    if (!pendingFile) {
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    const title = uploadTitle.trim() || undefined;
    closeUploadModal();
    void mediaService
      .upload(pendingFile, title)
      .then((uploaded) => {
        setMediaList((prev) => [uploaded, ...prev]);
      })
      .catch(() => {
        setUploadError(t('media.upload.error'));
      })
      .finally(() => {
        setIsUploading(false);
      });
  }, [pendingFile, uploadTitle, mediaService, closeUploadModal]);

  const openDeleteDialog = useCallback((media: MediaImage) => setDeleteTarget(media), []);
  const closeDeleteDialog = useCallback(() => setDeleteTarget(null), []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) {
      return;
    }
    const id = deleteTarget.id;
    setIsDeleting(true);
    setDeleteError(null);
    closeDeleteDialog();
    void mediaService
      .delete(id)
      .then(() => {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      })
      .catch(() => {
        setDeleteError(t('media.delete.error'));
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }, [deleteTarget, mediaService, closeDeleteDialog]);

  return {
    mediaList,
    filteredMedia,
    search,
    activeFilter,
    filterOptions,
    linkTypeLabels,
    isLoading,
    isUploading,
    uploadError,
    isUploadModalOpen,
    pendingFile,
    uploadTitle,
    deleteTarget,
    isDeleting,
    deleteError,
    setSearch,
    setActiveFilter,
    selectMedia,
    openUploadModal,
    closeUploadModal,
    setPendingFile,
    setUploadTitle,
    confirmUpload,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
}
