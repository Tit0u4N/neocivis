'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'apps/town-hall-web/src/components/ui/alert-dialog';
import { BackButton } from 'apps/town-hall-web/src/components/ui/back-button';
import { Button } from 'apps/town-hall-web/src/components/ui/button';
import { Input } from 'apps/town-hall-web/src/components/ui/input';
import { Label } from 'apps/town-hall-web/src/components/ui/label';
import { PageLayout } from 'apps/town-hall-web/src/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'apps/town-hall-web/src/components/ui/select';
import { Skeleton } from 'apps/town-hall-web/src/components/ui/skeleton';
import { MediaGallery } from 'apps/town-hall-web/src/features/media-gallery/MediaGallery';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { useEstablishmentFormPage } from './useEstablishmentFormPage';

type Props = ReturnType<typeof useEstablishmentFormPage>;

export function EstablishmentFormPage(props: Props) {
  const {
    isEditing,
    form,
    errors,
    isLoading,
    isSubmitting,
    apiError,
    showDiscardDialog,
    isPickerOpen,
    setField,
    openImagePicker,
    closeImagePicker,
    handleMediaSelect,
    handleSubmit,
    handleCancel,
    handleBack,
    confirmDiscard,
    closeDiscardDialog,
  } = props;

  const { t } = useTranslation();

  const discardDialog = (
    <AlertDialog open={showDiscardDialog} onOpenChange={(open) => !open && closeDiscardDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('establishment.form.discardDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('establishment.form.discardDialog.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDiscardDialog}>
            {t('establishment.form.discardDialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={confirmDiscard}>
            {t('establishment.form.discardDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return (
      <PageLayout title={isEditing ? t('establishment.form.titleEdit') : t('establishment.form.titleCreate')}>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEditing ? t('establishment.form.titleEdit') : t('establishment.form.titleCreate')}>
      {discardDialog}
      <div className="max-w-3xl space-y-6">
        <BackButton onClick={handleBack}>{t('establishment.form.back')}</BackButton>

        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {apiError}
          </div>
        )}

        {/* Nom */}
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('establishment.form.fields.name')}</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={t('establishment.form.fields.namePlaceholder')}
            aria-invalid={errors.name !== undefined}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>{t('establishment.form.fields.type')}</Label>
          <Select value={form.type} onValueChange={(v) => setField('type', v as typeof form.type)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="town_hall">{t('establishment.types.town_hall')}</SelectItem>
              <SelectItem value="education">{t('establishment.types.education')}</SelectItem>
              <SelectItem value="culture">{t('establishment.types.culture')}</SelectItem>
              <SelectItem value="sport">{t('establishment.types.sport')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Adresse */}
        <div className="space-y-1.5">
          <Label htmlFor="address">{t('establishment.form.fields.address')}</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder={t('establishment.form.fields.addressPlaceholder')}
            aria-invalid={errors.address !== undefined}
          />
          {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
        </div>

        {/* Horaires */}
        <div className="space-y-1.5">
          <Label htmlFor="hours">{t('establishment.form.fields.hours')}</Label>
          <Input
            id="hours"
            value={form.hours}
            onChange={(e) => setField('hours', e.target.value)}
            placeholder={t('establishment.form.fields.hoursPlaceholder')}
            aria-invalid={errors.hours !== undefined}
          />
          {errors.hours && <p className="text-destructive text-xs">{errors.hours}</p>}
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t('establishment.form.fields.phone')}</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder={t('establishment.form.fields.phonePlaceholder')}
            aria-invalid={errors.phone !== undefined}
          />
          {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
        </div>

        {/* Image */}
        <div className="space-y-1.5">
          <Label>{t('establishment.form.fields.image')}</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-28 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border border-dashed bg-muted">
              {form.imageUrl ? (
                // biome-ignore lint/performance/noImgElement: external URL from media gallery
                <img
                  src={form.imageUrl}
                  alt={form.name || t('establishment.form.fields.imageAlt')}
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-7 text-muted-foreground/50" />
              )}
            </div>
            <Button variant="outline" size="sm" onClick={openImagePicker} className="gap-1.5">
              <ImageIcon className="size-3.5" />
              {form.imageUrl ? t('establishment.form.fields.imageChange') : t('establishment.form.fields.imageChoose')}
            </Button>
          </div>
          {isPickerOpen && <MediaGallery mode="picker" onSelect={handleMediaSelect} onClose={closeImagePicker} />}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t pt-4">
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('establishment.form.save')}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t('establishment.form.cancel')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
