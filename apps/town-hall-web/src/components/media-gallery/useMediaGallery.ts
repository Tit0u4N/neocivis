'use client';

import type { MediaImage, MediaImageLinkType } from '@repo/contracts/media';
import { MediaImageLinkType as MediaImageLinkTypeSchema } from '@repo/contracts/media';
import { MediaService } from '@repo/frontend-services/media';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

export type MediaFilter = 'all' | MediaImageLinkType | 'unused';

export type MediaFilterOption = {
  id: MediaFilter;
  label: string;
};

export const MEDIA_LINK_TYPE_LABELS: Record<MediaImageLinkType, string> = {
  carousel: 'Carousel',
  articles: 'Articles',
  establishments: 'Établissements',
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
  isLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setSearch: (s: string) => void;
  setActiveFilter: (f: MediaFilter) => void;
  selectMedia: (media: MediaImage) => void;
  triggerUpload: () => void;
  handleFileChange: (file: File | null) => void;
};

export function useMediaGallery({ onSelect }: UseMediaGalleryProps): MediaGalleryViewModel {
  const api = useApi();
  const cityId = useCityStore((s) => s.cityId);
  const mediaService = useMemo(() => new MediaService(api, cityId), [api, cityId]);

  const [mediaList, setMediaList] = useState<MediaImage[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const filterOptions = useMemo<MediaFilterOption[]>(
    () => [
      { id: 'all', label: 'Tous les médias' },
      ...MediaImageLinkTypeSchema.options.map((type) => ({
        id: type as MediaFilter,
        label: MEDIA_LINK_TYPE_LABELS[type],
      })),
      { id: 'unused', label: 'Non utilisés' },
    ],
    [],
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

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }
      setIsUploading(true);
      setUploadError(null);
      void mediaService
        .upload(file)
        .then((uploaded) => {
          setMediaList((prev) => [uploaded, ...prev]);
        })
        .catch(() => {
          setUploadError("Échec de l'upload");
        })
        .finally(() => {
          setIsUploading(false);
        });
    },
    [mediaService],
  );

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    mediaList,
    filteredMedia,
    search,
    activeFilter,
    filterOptions,
    isLoading,
    isUploading,
    uploadError,
    fileInputRef,
    setSearch,
    setActiveFilter,
    selectMedia,
    triggerUpload,
    handleFileChange,
  };
}
