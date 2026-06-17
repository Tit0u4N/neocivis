'use client';

import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/ui/page-layout';
import { MediaGallery } from '@/features/media-gallery/MediaGallery';

export default function MediaPage() {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('media.gallery.title')} className="min-h-0 p-0">
      <div className="min-h-0 flex-1">
        <MediaGallery mode="gallery" />
      </div>
    </PageLayout>
  );
}
