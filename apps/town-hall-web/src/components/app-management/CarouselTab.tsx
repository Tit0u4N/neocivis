'use client';

import { ImageIcon, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CarouselTabViewModel } from './useCarouselTab';

type Props = {
  vm: CarouselTabViewModel;
  isSaving: boolean;
  saveError: string | null;
  saveConfig: () => Promise<void>;
};

export function CarouselTab({ vm, isSaving, saveError, saveConfig }: Props) {
  const { carousel, addSlide, removeSlide, updateSlide, updateTranslation } = vm;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{t('appManagement.carousel.hint')}</p>
        <Button size="sm" onClick={addSlide} className="gap-1.5">
          <Plus className="size-3.5" />
          {t('appManagement.carousel.add')}
        </Button>
      </div>

      {carousel.length === 0 && <p className="text-muted-foreground text-sm">{t('appManagement.carousel.empty')}</p>}

      <div className="flex flex-col gap-6">
        {carousel.map((slide, idx) => (
          <div key={slide.id} className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-sm">{t('appManagement.carousel.slideLabel', { n: idx + 1 })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSlide(slide.id)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="font-medium text-muted-foreground text-xs">
                  {t('appManagement.carousel.imageUrl')}
                </Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    className="h-8 text-sm"
                    value={slide.imageUrl ?? ''}
                    onChange={(e) => updateSlide(slide.id, { imageUrl: e.target.value || undefined })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-medium text-muted-foreground text-xs">
                  {t('appManagement.carousel.linkUrl')}
                </Label>
                <Input
                  className="h-8 text-sm"
                  value={slide.linkUrl ?? ''}
                  onChange={(e) => updateSlide(slide.id, { linkUrl: e.target.value || undefined })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-medium text-muted-foreground text-xs">
                {t('appManagement.carousel.translations')}
              </Label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground text-xs">
                      <th className="pr-3 pb-1 font-medium">Lang</th>
                      <th className="pr-3 pb-1 font-medium">{t('appManagement.carousel.fieldTitle')}</th>
                      <th className="pr-3 pb-1 font-medium">{t('appManagement.carousel.fieldDescription')}</th>
                      <th className="pb-1 font-medium">{t('appManagement.carousel.fieldTag')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slide.translations.map((tr) => (
                      <tr key={tr.locale}>
                        <td className="py-0.5 pr-3">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{tr.locale}</span>
                        </td>
                        <td className="py-0.5 pr-3">
                          <Input
                            className="h-7 text-xs"
                            value={tr.title}
                            onChange={(e) => updateTranslation(slide.id, tr.locale, 'title', e.target.value)}
                          />
                        </td>
                        <td className="py-0.5 pr-3">
                          <Input
                            className="h-7 text-xs"
                            value={tr.description ?? ''}
                            onChange={(e) => updateTranslation(slide.id, tr.locale, 'description', e.target.value)}
                          />
                        </td>
                        <td className="py-0.5">
                          <Input
                            className="h-7 text-xs"
                            value={tr.tag ?? ''}
                            onChange={(e) => updateTranslation(slide.id, tr.locale, 'tag', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        {saveError && <span className="text-destructive text-sm">{saveError}</span>}
        <Button onClick={saveConfig} disabled={isSaving} className="gap-1.5">
          <Save className="size-3.5" />
          {isSaving ? t('appManagement.saving') : t('appManagement.save')}
        </Button>
      </div>
    </div>
  );
}
