'use client';

import { ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MediaGallery } from '@/features/media-gallery/MediaGallery';
import { PlateEditor } from '@/components/plate-editor/PlateEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { useArticleFormPage } from './useArticleFormPage';

type Props = ReturnType<typeof useArticleFormPage>;

export function ArticleFormPage(props: Props) {
  const {
    isEditing,
    form,
    errors,
    isLoading,
    isSubmitting,
    apiError,
    showDiscardDialog,
    setField,
    isPickerOpen,
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
          <AlertDialogTitle>{t('articles.form.discardDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('articles.form.discardDialog.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDiscardDialog}>{t('articles.form.discardDialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDiscard}>{t('articles.form.discardDialog.confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return (
      <PageLayout title={isEditing ? t('articles.form.titleEdit') : t('articles.form.titleCreate')}>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEditing ? t('articles.form.titleEdit') : t('articles.form.titleCreate')}>
      {discardDialog}
      <div className="max-w-3xl space-y-6">
        <BackButton onClick={handleBack}>{t('common.back')}</BackButton>
        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {apiError}
          </div>
        )}

        {/* Titre */}
        <div className="space-y-1.5">
          <Label htmlFor="title">{t('articles.form.fields.title')}</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder={t('articles.form.fields.titlePlaceholder')}
            aria-invalid={errors.title !== undefined}
          />
          {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">{t('articles.form.fields.description')}</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder={t('articles.form.fields.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        {/* Image de couverture */}
        <div className="space-y-1.5">
          <Label>{t('articles.form.fields.coverImage')}</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-28 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border border-dashed bg-muted">
              {form.coverImageUrl ? (
                // biome-ignore lint/performance/noImgElement: external URL from media gallery
                <img
                  src={form.coverImageUrl}
                  alt={t('articles.form.fields.coverImageAlt')}
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-7 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={openImagePicker} className="gap-1.5">
                <ImageIcon className="size-3.5" />
                {form.coverImageUrl
                  ? t('articles.form.fields.coverImageChange')
                  : t('articles.form.fields.coverImageChoose')}
              </Button>
              {errors.coverImageUrl && <p className="text-destructive text-xs">{errors.coverImageUrl}</p>}
            </div>
          </div>
          {isPickerOpen && <MediaGallery mode="picker" onSelect={handleMediaSelect} onClose={closeImagePicker} />}
        </div>

        {/* Statut */}
        <div className="space-y-1.5">
          <Label>{t('articles.form.fields.status')}</Label>
          <Select value={form.status} onValueChange={(v) => setField('status', v as 'draft' | 'published')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t('articles.form.status.draft')}</SelectItem>
              <SelectItem value="published">{t('articles.form.status.published')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contenu */}
        <div className="space-y-1.5">
          <Label>{t('articles.form.fields.content')}</Label>
          <PlateEditor
            value={form.content as unknown[] | undefined}
            onChange={(v) => setField('content', v)}
            placeholder={t('articles.form.fields.contentPlaceholder')}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t pt-4">
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('common.save')}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
