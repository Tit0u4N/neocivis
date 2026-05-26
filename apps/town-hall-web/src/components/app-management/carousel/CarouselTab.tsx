'use client';

import { ChevronDown, ChevronUp, ImageIcon, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MediaGallery } from '@/features/media-gallery/MediaGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { LinkPicker } from '../LinkPicker';
import { LocaleManager } from '../LocaleManager';
import { useCarouselTab } from './useCarouselTab';

export function CarouselTab() {
  const { t } = useTranslation();
  const vm = useCarouselTab();
  const {
    carousel,
    selectedId,
    selectedSlide,
    defaultLocale,
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    setSelectedId,
    addSlide,
    removeSlide,
    moveSlide,
    addLocaleToSelected,
    removeLocaleFromSelected,
    updateTranslation,
    getSlideLink,
    updateSlideLink,
    isPickerOpen,
    openImagePicker,
    closeImagePicker,
    handleMediaSelect,
  } = vm;

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t('appManagement.loading')}</p>;
  }

  return (
    <div className="flex items-start gap-0 pt-3">
      {/* Left: slide list */}
      <div className="flex w-72 shrink-0 flex-col gap-4 pr-7">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground text-lg">{t('appManagement.carousel.slides')}</span>
          <Button size="sm" onClick={addSlide} className="gap-1.5">
            <Plus className="size-3.5" />
            {t('appManagement.carousel.add')}
          </Button>
        </div>

        {carousel.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('appManagement.carousel.empty')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {carousel.map((slide, i) => {
              const isSel = slide.id === selectedId;
              const title =
                slide.translations.find((tr) => tr.locale === defaultLocale)?.title ||
                slide.translations.find((tr) => tr.title)?.title ||
                '';
              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: Card
                <div
                  key={slide.id}
                  onClick={() => setSelectedId(slide.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all',
                    isSel ? 'border-2 border-foreground bg-muted/50' : 'border-border bg-background hover:bg-muted/30',
                  )}
                >
                  <span className="w-5 shrink-0 text-center font-mono text-muted-foreground text-xs">{i + 1}</span>
                  {/* Thumbnail */}
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground text-sm">
                      {title || t('appManagement.carousel.untitled')}
                    </p>
                    {slide.linkUrl && <p className="truncate text-muted-foreground text-xs">→ {slide.linkUrl}</p>}
                  </div>
                  {/* Reorder */}
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(slide.id, -1);
                      }}
                      disabled={i === 0}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(slide.id, 1);
                      }}
                      disabled={i === carousel.length - 1}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-muted-foreground text-xs">{t('appManagement.carousel.count', { count: carousel.length })}</p>
      </div>

      <Separator orientation="vertical" className="mx-0 min-h-120 data-[orientation=vertical]:h-auto" />

      {/* Right: slide editor */}
      <div className="flex min-w-0 flex-1 flex-col gap-6 pl-8">
        <span className="font-bold text-foreground text-lg">{t('appManagement.carousel.settings')}</span>

        {selectedSlide ? (
          <div className="flex flex-col gap-5">
            {/* Image */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-muted-foreground text-xs">
                {t('appManagement.carousel.imageUrl')}
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex h-28 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border border-dashed bg-muted">
                  {selectedSlide.imageUrl ? (
                    // biome-ignore lint/performance/noImgElement: external URL from media gallery
                    <img src={selectedSlide.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-7 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={openImagePicker} className="gap-1.5">
                    <ImageIcon className="size-3.5" />
                    {selectedSlide.imageUrl
                      ? t('appManagement.carousel.changeImage')
                      : t('appManagement.carousel.chooseImage')}
                  </Button>
                  <p className="text-muted-foreground text-xs">{t('appManagement.carousel.imageHint')}</p>
                </div>
              </div>
            </div>

            {isPickerOpen && <MediaGallery mode="picker" onSelect={handleMediaSelect} onClose={closeImagePicker} />}

            {/* Link */}
            <LinkPicker
              label={t('appManagement.carousel.linkUrl')}
              value={getSlideLink(selectedSlide)}
              onChange={(link) => updateSlideLink(selectedSlide.id, link)}
            />

            {/* Translations — locale list with add/remove, like CategoryLayoutTab */}
            <LocaleManager
              label={t('appManagement.carousel.translations')}
              translations={selectedSlide.translations}
              defaultLocale={defaultLocale}
              onAdd={addLocaleToSelected}
              onRemove={removeLocaleFromSelected}
              renderRow={(tr) => (
                <>
                  <div className="flex flex-col gap-1">
                    <Label className="font-medium text-muted-foreground text-xs">
                      {t('appManagement.carousel.fieldTitle')}
                    </Label>
                    <Input
                      className="h-8 text-sm"
                      value={tr.title}
                      onChange={(e) => updateTranslation(selectedSlide.id, tr.locale, 'title', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="font-medium text-muted-foreground text-xs">
                      {t('appManagement.carousel.fieldDescription')}
                    </Label>
                    <Input
                      className="h-8 text-sm"
                      value={tr.description ?? ''}
                      onChange={(e) => updateTranslation(selectedSlide.id, tr.locale, 'description', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="font-medium text-muted-foreground text-xs">
                      {t('appManagement.carousel.fieldTag')}
                    </Label>
                    <Input
                      className="h-8 text-sm"
                      value={tr.tag ?? ''}
                      onChange={(e) => updateTranslation(selectedSlide.id, tr.locale, 'tag', e.target.value)}
                    />
                  </div>
                </>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeSlide(selectedSlide.id)}
                className="gap-1.5"
                disabled={carousel.length <= 1}
              >
                <Trash2 className="size-3.5" />
                {t('appManagement.carousel.remove')}
              </Button>
              <div className="flex items-center gap-2">
                {saveError && <span className="text-destructive text-sm">{saveError}</span>}
                <Button onClick={saveConfig} disabled={isSaving} className="gap-1.5">
                  <Save className="size-3.5" />
                  {isSaving ? t('appManagement.saving') : t('appManagement.save')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('appManagement.carousel.empty')}</p>
        )}
      </div>
    </div>
  );
}
