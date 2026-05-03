'use client';

import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AppTile, MovePreview, ResizeHandle } from './useAppManagementPage';
import { tintFrom } from './useAppManagementPage';

function TileGlyph({ id, size }: { id: string; size: number }) {
  if (!id || id === 'none') {
    return null;
  }
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[id];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent size={size} />;
}

type ResizeHandleProps = {
  pos: ResizeHandle;
  blockId: number;
  onStart: (blockId: number, handle: ResizeHandle) => void;
  ariaLabel: string;
};

function TileResizeHandle({ pos, blockId, onStart, ariaLabel }: ResizeHandleProps) {
  const classNameMap: Record<ResizeHandle, string> = {
    right:
      'absolute right-[-3px] top-[20%] w-[6px] h-[60%] cursor-ew-resize rounded-[3px] z-[5] bg-transparent border-none p-0',
    bottom:
      'absolute bottom-[-3px] left-[20%] w-[60%] h-[6px] cursor-ns-resize rounded-[3px] z-[5] bg-transparent border-none p-0',
    br: 'absolute bottom-[-5px] right-[-5px] w-[14px] h-[14px] cursor-nwse-resize rounded-full z-[6] bg-white border-2 border-[rgb(38,38,39)] p-0',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={classNameMap[pos]}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onStart(blockId, pos);
      }}
    />
  );
}

type GridTileProps = {
  block: AppTile;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: number) => void;
  onResizeStart: (blockId: number, handle: ResizeHandle) => void;
  onMoveStart: (blockId: number, mouseX: number, mouseY: number) => void;
};

function GridTile({ block, isSelected, isDragging, onSelect, onResizeStart, onMoveStart }: GridTileProps) {
  const { t } = useTranslation();
  const bg = tintFrom(block.fg, 0.86);
  const big = block.w >= 2 || block.h >= 2;
  const iconSize = big ? 22 : 20;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This is a tile not a real button so it's better to be a div
    <div
      onMouseDown={(e) => {
        onSelect(block.id);
        onMoveStart(block.id, e.clientX, e.clientY);
      }}
      className={cn(
        'relative flex flex-col justify-between overflow-visible rounded-[22px] border-0 outline-2 outline-solid outline-offset-2',
        big ? 'p-4' : 'p-3',
        isDragging
          ? 'cursor-grabbing opacity-[0.35] transition-none'
          : 'cursor-grab opacity-100 [transition:outline-color_0.12s,opacity_0.12s]',
        isSelected ? 'outline-[rgb(38,38,39)]' : 'outline-transparent',
      )}
      style={{
        gridColumn: `${block.col + 1} / span ${block.w}`,
        gridRow: `${block.row + 1} / span ${block.h}`,
        backgroundColor: bg,
      }}
    >
      <div
        className={cn('flex items-center justify-center rounded-xl bg-white/70', big ? 'h-11 w-11' : 'h-9.5 w-9.5')}
        style={{ color: block.fg }}
      >
        <TileGlyph id={block.icon} size={iconSize} />
      </div>

      <div className={cn('font-bold text-[18px] leading-[1.15] tracking-[-0.01em]')} style={{ color: block.fg }}>
        {block.title}
      </div>

      {isSelected && (
        <>
          <TileResizeHandle
            pos="right"
            blockId={block.id}
            onStart={onResizeStart}
            ariaLabel={t('appManagement.grid.resizeAria.right')}
          />
          <TileResizeHandle
            pos="bottom"
            blockId={block.id}
            onStart={onResizeStart}
            ariaLabel={t('appManagement.grid.resizeAria.bottom')}
          />
          <TileResizeHandle
            pos="br"
            blockId={block.id}
            onStart={onResizeStart}
            ariaLabel={t('appManagement.grid.resizeAria.br')}
          />
        </>
      )}
    </div>
  );
}

export type TileGridProps = {
  blocks: AppTile[];
  selectedId: number;
  rows: number;
  gridW: number;
  isDragging: boolean;
  movingBlockId: number | null;
  movePreview: MovePreview | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
  selectBlock: (id: number) => void;
  addBlock: () => void;
  resetBlocks: () => void;
  handleResizeStart: (blockId: number, handle: ResizeHandle) => void;
  handleMoveStart: (blockId: number, mouseX: number, mouseY: number) => void;
};

export function TileGrid({
  blocks,
  selectedId,
  rows,
  gridW,
  isDragging,
  movingBlockId,
  movePreview,
  gridRef,
  selectBlock,
  addBlock,
  resetBlocks,
  handleResizeStart,
  handleMoveStart,
}: TileGridProps) {
  const { t } = useTranslation();
  const draggedBlock = movingBlockId !== null ? blocks.find((b) => b.id === movingBlockId) : null;
  const showGhost = !!(movePreview?.activated && draggedBlock);

  return (
    <div className="shrink-0 pr-8">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-bold text-foreground text-lg">{t('appManagement.grid.title')}</span>
        <div className="flex gap-2">
          <Button size="sm" onClick={addBlock} className="gap-1.5">
            <Plus className="size-3.5" />
            {t('appManagement.grid.add')}
          </Button>
          <Button size="sm" variant="outline" onClick={resetBlocks} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            {t('appManagement.grid.reset')}
          </Button>
        </div>
      </div>

      <div
        ref={gridRef}
        className={cn(
          'relative grid auto-rows-[150px] grid-cols-[repeat(3,150px)] gap-3',
          isDragging ? 'select-none' : 'select-auto',
        )}
        style={{ width: gridW }}
      >
        {blocks.map((block) => (
          <GridTile
            key={block.id}
            block={block}
            isSelected={selectedId === block.id}
            isDragging={movePreview?.activated === true && movingBlockId === block.id}
            onSelect={selectBlock}
            onResizeStart={handleResizeStart}
            onMoveStart={handleMoveStart}
          />
        ))}

        {showGhost && draggedBlock && (
          <div
            aria-hidden="true"
            className="pointer-events-none z-10 rounded-[22px] [transition:grid-column_0.08s,grid-row_0.08s]"
            style={{
              gridColumn: `${(movePreview?.col ?? 0) + 1} / span ${draggedBlock.w}`,
              gridRow: `${(movePreview?.row ?? 0) + 1} / span ${draggedBlock.h}`,
              border: `2px dashed ${draggedBlock.fg}`,
              backgroundColor: tintFrom(draggedBlock.fg, 0.93),
            }}
          />
        )}
      </div>

      <p className="mt-3.5 text-muted-foreground text-xs">
        {t('appManagement.grid.footer', { cols: 3, rows, count: blocks.length })}
      </p>
    </div>
  );
}
