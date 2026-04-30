'use client';

import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { AppTile, MovePreview, ResizeHandle } from './useAppManagementPage';
import { CELL, COLS, GAP, tintFrom } from './useAppManagementPage';

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
  const cursorMap: Record<ResizeHandle, string> = {
    right: 'ew-resize',
    bottom: 'ns-resize',
    br: 'nwse-resize',
  };

  const styleMap: Record<ResizeHandle, React.CSSProperties> = {
    right: {
      position: 'absolute',
      right: -3,
      top: '20%',
      width: 6,
      height: '60%',
      cursor: cursorMap[pos],
      borderRadius: 3,
      zIndex: 5,
    },
    bottom: {
      position: 'absolute',
      bottom: -3,
      left: '20%',
      width: '60%',
      height: 6,
      cursor: cursorMap[pos],
      borderRadius: 3,
      zIndex: 5,
    },
    br: {
      position: 'absolute',
      bottom: -5,
      right: -5,
      width: 14,
      height: 14,
      cursor: cursorMap[pos],
      borderRadius: '50%',
      zIndex: 6,
      backgroundColor: '#fff',
      border: '2px solid rgb(38,38,39)',
    },
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      style={{
        ...styleMap[pos],
        background: 'none',
        border: pos === 'br' ? '2px solid rgb(38,38,39)' : 'none',
        padding: 0,
      }}
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
  const iconBox = big ? 44 : 38;
  const iconSize = big ? 22 : 20;

  return (
    <button
      type="button"
      aria-label={t('appManagement.grid.tileAria', { title: block.title })}
      aria-pressed={isSelected}
      onMouseDown={(e) => {
        onSelect(block.id);
        onMoveStart(block.id, e.clientX, e.clientY);
      }}
      style={{
        gridColumn: `${block.col + 1} / span ${block.w}`,
        gridRow: `${block.row + 1} / span ${block.h}`,
        backgroundColor: bg,
        borderRadius: 22,
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: big ? 16 : 12,
        position: 'relative',
        outline: isSelected ? '2px solid rgb(38,38,39)' : '2px solid transparent',
        outlineOffset: 2,
        transition: isDragging ? 'none' : 'outline-color 0.12s, opacity 0.12s',
        overflow: 'visible',
        opacity: isDragging ? 0.35 : 1,
        border: 'none',
      }}
    >
      <div
        style={{
          width: iconBox,
          height: iconBox,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: block.fg,
        }}
      >
        <TileGlyph id={block.icon} size={iconSize} />
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: big ? 18 : 15,
          color: block.fg,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}
      >
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
    </button>
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
    <div style={{ paddingRight: 32, flexShrink: 0 }}>
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
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridAutoRows: `${CELL}px`,
          gap: GAP,
          width: gridW,
          position: 'relative',
          userSelect: isDragging ? 'none' : 'auto',
        }}
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
            style={{
              gridColumn: `${(movePreview?.col ?? 0) + 1} / span ${draggedBlock.w}`,
              gridRow: `${(movePreview?.row ?? 0) + 1} / span ${draggedBlock.h}`,
              borderRadius: 22,
              border: `2px dashed ${draggedBlock.fg}`,
              backgroundColor: tintFrom(draggedBlock.fg, 0.93),
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'grid-column 0.08s, grid-row 0.08s',
            }}
          />
        )}
      </div>

      <p className="mt-3.5 text-muted-foreground text-xs">
        {t('appManagement.grid.footer', { cols: COLS, rows, count: blocks.length })}
      </p>
    </div>
  );
}
