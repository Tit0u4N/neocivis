'use client';

import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { IconPickerModal } from './IconPickerModal';
import { TileGrid } from './TileGrid';
import type { AppManagementViewModel, TileLinkId } from './useAppManagementPage';
import { COLOR_PRESETS, hexToRgb, LINK_GROUPS, rgbToHex, tintFrom } from './useAppManagementPage';

export function AppManagementPage({
  blocks,
  selectedId,
  sel,
  rows,
  gridW,
  isDragging,
  movingBlockId,
  movePreview,
  gridRef,
  selectBlock,
  addBlock,
  removeBlock,
  resetBlocks,
  setBlockProp,
  handleResizeStart,
  handleMoveStart,
}: AppManagementViewModel) {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('appManagement.title')}>
      <p className="text-muted-foreground text-sm">{t('appManagement.hint')}</p>

      <div className="flex items-start gap-0">
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

        <Separator orientation="vertical" className="mx-0 min-h-120 data-[orientation=vertical]:h-auto" />

        {/* Right: Tile settings */}
        <div className="min-w-70 flex-1 pl-8">
          <span className="mb-5 block font-bold text-foreground text-lg">{t('appManagement.settings.title')}</span>

          <div className="flex flex-col gap-5">
            {/* Size info */}
            <div className="flex items-center gap-3">
              <span className="rounded-md border bg-muted px-3 py-1 font-semibold text-muted-foreground text-xs">
                {t('appManagement.settings.sizeLabel', { w: sel.w, h: sel.h })}
              </span>
              <span className="text-muted-foreground text-xs">
                {t('appManagement.settings.positionLabel', { col: sel.col + 1, row: sel.row + 1 })}
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <Label className="font-medium text-muted-foreground text-xs">
                {t('appManagement.settings.titleLabel')}
              </Label>
              <Input
                className={'h-9'}
                value={sel.title}
                onChange={(e) => setBlockProp('title', e.target.value)}
                placeholder={t('appManagement.settings.titlePlaceholder')}
              />
            </div>

            {/* Icon + Link */}
            <div className="grid grid-cols-2 gap-3.5">
              <IconPickerModal value={sel.icon} onChange={(v) => setBlockProp('icon', v)} />
              <div className="flex flex-col gap-1.5">
                <Label className="font-medium text-muted-foreground text-xs">
                  {t('appManagement.settings.linkLabel')}
                </Label>
                <Select value={sel.link} onValueChange={(v) => setBlockProp('link', v as TileLinkId)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position={'popper'}>
                    {LINK_GROUPS.map((group) => (
                      <SelectGroup key={group.groupId}>
                        <SelectLabel>{t(`appManagement.linkGroups.${group.groupId}`)}</SelectLabel>
                        {group.options.map((id) => (
                          <SelectItem key={id} value={id}>
                            {t(`appManagement.links.${id}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color presets */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-muted-foreground text-xs">
                {t('appManagement.settings.presetColors')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((p) => {
                  const isActive = sel.fg === p.fg;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      title={t(`appManagement.colors.${p.name}`)}
                      onClick={() => setBlockProp('fg', p.fg)}
                      className={cn(
                        'flex size-9 cursor-pointer items-center justify-center rounded-xl border transition-all',
                        isActive ? 'border-2 border-foreground' : 'border-border',
                      )}
                      style={{ backgroundColor: p.bg }}
                    >
                      <span className="size-3.5 rounded-full" style={{ backgroundColor: p.fg }} />
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
                    value={rgbToHex(sel.fg)}
                    onChange={(e) => setBlockProp('fg', hexToRgb(e.target.value))}
                    className="-inset-0.5 absolute h-[calc(100%+4px)] w-[calc(100%+4px)] cursor-pointer border-none bg-none p-0"
                  />
                </div>
                <Input
                  value={rgbToHex(sel.fg).toUpperCase()}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-f]{6}$/i.test(v)) {
                      setBlockProp('fg', hexToRgb(v));
                    }
                  }}
                  className="flex-1 font-mono text-sm tracking-wider"
                  placeholder="#000000"
                />
                <div
                  title={t('appManagement.settings.bgTintTitle')}
                  className="size-11 shrink-0 rounded-xl border border-border"
                  style={{ backgroundColor: tintFrom(sel.fg, 0.86) }}
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
                  setBlockProp('title', '');
                  setBlockProp('link', 'Link');
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
        </div>
      </div>
    </PageLayout>
  );
}
