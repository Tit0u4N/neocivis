'use client';

import { Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/stores/config.store';
import { LinkPicker } from '../LinkPicker';
import { LocaleManager } from '../LocaleManager';
import { IconPickerModal } from './IconPickerModal';
import { TileGrid } from './TileGrid';
import { COLOR_PRESETS, tintFrom, useCategoryLayoutTab } from './useCategoryLayoutTab';

export function CategoryLayoutTab() {
  const { t } = useTranslation();
  const vm = useCategoryLayoutTab();

  const {
    blocks,
    selectedId,
    sel,
    rows,
    gridW,
    isDragging,
    movingBlockId,
    movePreview,
    gridRef,
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    selectBlock,
    addBlock,
    removeBlock,
    resetBlocks,
    setBlockProp,
    addLocaleToSelected,
    removeLocaleFromSelected,
    updateTranslationName,
    handleResizeStart,
    handleMoveStart,
  } = vm;
  const defaultLocale = useConfigStore((s) => s.defaultLocale);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t('appManagement.loading')}</p>;
  }

  return (
    <div className="flex items-start gap-0 pt-3">
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">{t('appManagement.hint')}</p>
        <TileGrid
          blocks={blocks}
          selectedId={selectedId}
          rows={rows}
          gridW={gridW}
          isDragging={isDragging}
          movingBlockId={movingBlockId}
          movePreview={movePreview}
          gridRef={gridRef}
          selectBlock={selectBlock}
          addBlock={addBlock}
          resetBlocks={resetBlocks}
          handleResizeStart={handleResizeStart}
          handleMoveStart={handleMoveStart}
        />
      </div>

      <Separator orientation="vertical" className="mx-0 min-h-120 data-[orientation=vertical]:h-auto" />

      {/* Right: Tile settings + save */}
      <div className="flex min-w-70 flex-1 flex-col gap-6 pl-8">
        <span className="mb-5 block font-bold text-foreground text-lg">{t('appManagement.settings.title')}</span>

        <div className="flex flex-col gap-5">
          {/* Size info */}
          <div className="flex items-center gap-3">
            <span className="rounded-md border bg-muted px-3 py-1 font-semibold text-muted-foreground text-xs">
              {t('appManagement.settings.sizeLabel', { w: sel.colSpan, h: sel.rowSpan })}
            </span>
            <span className="text-muted-foreground text-xs">
              {t('appManagement.settings.positionLabel', { col: sel.col + 1, row: sel.row + 1 })}
            </span>
          </div>

          {/* Translations */}
          <LocaleManager
            label={t('appManagement.settings.translations')}
            translations={sel.translations}
            defaultLocale={defaultLocale}
            onAdd={addLocaleToSelected}
            onRemove={removeLocaleFromSelected}
            renderRow={(tr) => (
              <Input
                className="h-8 text-sm"
                value={tr.name}
                onChange={(e) => updateTranslationName(tr.locale, e.target.value)}
                placeholder={t('appManagement.settings.translationPlaceholder', { locale: tr.locale })}
              />
            )}
          />

          {/* Icon + Link */}
          <div className="grid grid-cols-2 gap-3.5">
            <IconPickerModal value={sel.icon} onChange={(v) => setBlockProp('icon', v)} />
            <LinkPicker
              label={t('appManagement.settings.linkLabel')}
              value={sel.link}
              onChange={(link) => setBlockProp('link', link)}
            />
          </div>

          {/* Color presets */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-muted-foreground text-xs">
              {t('appManagement.settings.presetColors')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p) => {
                const isActive = sel.color === p.color;
                return (
                  <button
                    key={p.name}
                    type="button"
                    title={t(`appManagement.colors.${p.name}`)}
                    onClick={() => setBlockProp('color', p.color)}
                    className={cn(
                      'flex size-9 cursor-pointer items-center justify-center rounded-xl border transition-all',
                      isActive ? 'border-2 border-foreground' : 'border-border',
                    )}
                    style={{ backgroundColor: p.bg }}
                  >
                    <span className="size-3.5 rounded-full" style={{ backgroundColor: p.color }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom color picker */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-muted-foreground text-xs">
              {t('appManagement.settings.customColor')}
            </Label>
            <div className="flex items-center gap-2.5">
              <div className="relative size-11 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                <input
                  type="color"
                  value={sel.color}
                  onChange={(e) => setBlockProp('color', e.target.value)}
                  className="-inset-0.5 absolute h-[calc(100%+4px)] w-[calc(100%+4px)] cursor-pointer border-none bg-none p-0"
                />
              </div>
              <Input
                value={sel.color.toUpperCase()}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-f]{6}$/i.test(v)) {
                    setBlockProp('color', v.toUpperCase());
                  }
                }}
                className="flex-1 font-mono text-sm tracking-wider"
                placeholder="#000000"
              />
              <div
                title={t('appManagement.settings.bgTintTitle')}
                className="size-11 shrink-0 rounded-xl border border-border"
                style={{ backgroundColor: tintFrom(sel.color, 0.86) }}
              />
            </div>
            <p className="text-muted-foreground text-xs">{t('appManagement.settings.bgTintHint')}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBlockProp('icon', 'none');
                setBlockProp('link', { type: 'Link' });
              }}
            >
              {t('appManagement.settings.clear')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={blocks.length <= 1}
              onClick={() => removeBlock(sel.id)}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              {t('appManagement.settings.delete')}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {saveError && <span className="text-destructive text-sm">{saveError}</span>}
            <Button onClick={saveConfig} disabled={isSaving} className="gap-1.5">
              <Save className="size-3.5" />
              {isSaving ? t('appManagement.saving') : t('appManagement.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
