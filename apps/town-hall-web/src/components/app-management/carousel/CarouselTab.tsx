'use client';

import { ChevronDown, ChevronUp, ImageIcon, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type Locale, useConfigStore } from '@/stores/config.store';
import { useCarouselTab } from './useCarouselTab';

export function CarouselTab() {
  const { t } = useTranslation();
  const vm = useCarouselTab();
  const {
    carousel,
    selectedId,
    selectedSlide,
    activeLang,
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    setSelectedId,
    setActiveLang,
    addSlide,
    removeSlide,
    moveSlide,
    updateSlide,
    updateTranslation,
  } = vm;

  const availableLocales = useConfigStore((s) => s.availableLocales);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t('appManagement.loading')}</p>;
  }

  const activeTranslation = selectedSlide?.translations.find((tr) => tr.locale === activeLang) ?? null;

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
              const titleFr =
                slide.translations.find((tr) => tr.locale === 'fr')?.title ||
                slide.translations.find((tr) => tr.title)?.title ||
                '';
              return (
                <button
                  key={slide.id}
                  type="button"
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
                      {titleFr || t('appManagement.carousel.untitled')}
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
                </button>
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
              <div className="flex items-start gap-4">
                <div className="flex h-28 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border border-dashed bg-muted">
                  {selectedSlide.imageUrl ? (
                    <img src={selectedSlide.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-7 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={selectedSlide.imageUrl ?? ''}
                    onChange={(e) => updateSlide(selectedSlide.id, { imageUrl: e.target.value || undefined })}
                    placeholder="https://..."
                    className="text-sm"
                  />
                  <p className="text-muted-foreground text-xs">{t('appManagement.carousel.imageHint')}</p>
                </div>
              </div>
            </div>

            {/* Locale tabs + translation fields */}
            <div className="flex flex-col gap-0">
              <Label className="mb-2 font-medium text-muted-foreground text-xs">
                {t('appManagement.carousel.translations')}
              </Label>
              {/* Tab bar */}
              <div className="-mb-px flex gap-1 border-border border-b">
                {availableLocales.map((locale) => {
                  const tr = selectedSlide.translations.find((t) => t.locale === locale);
                  const filled = !!tr?.title?.trim();
                  const isActive = activeLang === locale;
                  return (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => setActiveLang(locale as Locale)}
                      className={cn(
                        'flex items-center gap-1.5 border-b-2 px-3 py-2 font-medium text-xs transition-colors',
                        isActive
                          ? 'border-foreground text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <span className="font-mono uppercase">{locale}</span>
                      <span
                        className={cn('size-1.5 rounded-full', filled ? 'bg-green-500' : 'bg-muted-foreground/30')}
                      />
                    </button>
                  );
                })}
              </div>
              {/* Fields for active locale */}
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-xs">{t('appManagement.carousel.fieldTitle')}</Label>
                  <Input
                    value={activeTranslation?.title ?? ''}
                    onChange={(e) => updateTranslation(selectedSlide.id, activeLang, 'title', e.target.value)}
                    placeholder={t('appManagement.carousel.fieldTitle')}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-xs">
                    {t('appManagement.carousel.fieldDescription')}
                  </Label>
                  <Input
                    value={activeTranslation?.description ?? ''}
                    onChange={(e) => updateTranslation(selectedSlide.id, activeLang, 'description', e.target.value)}
                    placeholder={t('appManagement.carousel.fieldDescription')}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-xs">{t('appManagement.carousel.fieldTag')}</Label>
                  <Input
                    value={activeTranslation?.tag ?? ''}
                    onChange={(e) => updateTranslation(selectedSlide.id, activeLang, 'tag', e.target.value)}
                    placeholder={t('appManagement.carousel.fieldTag')}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Link URL */}
            <div className="flex flex-col gap-1.5">
              <Label className="font-medium text-muted-foreground text-xs">{t('appManagement.carousel.linkUrl')}</Label>
              <Input
                value={selectedSlide.linkUrl ?? ''}
                onChange={(e) => updateSlide(selectedSlide.id, { linkUrl: e.target.value || undefined })}
                placeholder="https://..."
                className="text-sm"
              />
            </div>

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
