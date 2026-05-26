'use client';

import { useTranslation } from 'react-i18next';
import { MediaGallery } from '@/features/media-gallery/MediaGallery';

export default function MediaPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-border border-b px-6 py-4">
        <div>
          <h1 className="font-bold text-foreground text-xl">{t('media.gallery.title')}</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">{t('media.page.subtitle')}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <MediaGallery mode="gallery" />
      </div>
    </div>
  );
}
