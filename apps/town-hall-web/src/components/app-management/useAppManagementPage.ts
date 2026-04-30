'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type TileIconId = string;

export type TileLinkId =
  | 'Link'
  | 'General'
  | 'Reports'
  | 'Forum'
  | 'Establishment'
  | 'Articles'
  | 'Events'
  | 'External URL';

export type ResizeHandle = 'right' | 'bottom' | 'br';

export type AppTile = {
  id: number;
  col: number;
  row: number;
  w: number;
  h: number;
  icon: TileIconId;
  title: string;
  link: TileLinkId;
  fg: string;
};

export type ColorPreset = {
  name: string;
  fg: string;
  bg: string;
};

export type MovePreview = {
  col: number;
  row: number;
  activated: boolean;
};

type ResizeDragInfo = {
  blockId: number;
  handle: ResizeHandle;
  rect: DOMRect;
};

type MoveDragInfo = {
  blockId: number;
  rect: DOMRect;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  blockW: number;
  blockH: number;
};

export const COLS = 3;
export const CELL = 150;
export const GAP = 12;
const DRAG_THRESHOLD = 5;

export const LINK_OPTIONS: { id: TileLinkId; label: string }[] = [
  { id: 'Link', label: 'Lien' },
  { id: 'General', label: 'Général' },
  { id: 'Reports', label: 'Signalements' },
  { id: 'Forum', label: 'Forum' },
  { id: 'Establishment', label: 'Établissement' },
  { id: 'Articles', label: 'Articles' },
  { id: 'Events', label: 'Événements' },
  { id: 'External URL', label: 'URL externe' },
];

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Corail', fg: 'rgb(244,69,40)', bg: 'rgb(255,229,224)' },
  { name: 'Azur', fg: 'rgb(35,116,224)', bg: 'rgb(225,235,250)' },
  { name: 'Ambre', fg: 'rgb(231,140,28)', bg: 'rgb(253,233,206)' },
  { name: 'Ardoise', fg: 'rgb(102,112,128)', bg: 'rgb(228,231,236)' },
  { name: 'Forêt', fg: 'rgb(34,148,73)', bg: 'rgb(218,238,224)' },
  { name: 'Violet', fg: 'rgb(124,79,217)', bg: 'rgb(231,222,247)' },
];

const initBlocks = (): AppTile[] => [
  { id: 0, col: 0, row: 0, w: 2, h: 1, icon: 'Star', title: 'À la Une', link: 'Articles', fg: 'rgb(244,69,40)' },
  { id: 1, col: 2, row: 0, w: 1, h: 1, icon: 'Info', title: 'Pratique', link: 'General', fg: 'rgb(35,116,224)' },
  {
    id: 2,
    col: 0,
    row: 1,
    w: 1,
    h: 1,
    icon: 'AlertTriangle',
    title: 'Urgence',
    link: 'Reports',
    fg: 'rgb(231,140,28)',
  },
  { id: 3, col: 1, row: 1, w: 2, h: 1, icon: 'Wrench', title: 'Travaux', link: 'Reports', fg: 'rgb(102,112,128)' },
  { id: 4, col: 0, row: 2, w: 1, h: 1, icon: 'BarChart2', title: 'Sondage', link: 'Forum', fg: 'rgb(34,148,73)' },
  { id: 5, col: 1, row: 2, w: 1, h: 1, icon: 'Globe', title: 'Divers', link: 'General', fg: 'rgb(124,79,217)' },
];

export function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m) {
    return '#000000';
  }
  return `#${m
    .slice(0, 3)
    .map((n) => Number.parseInt(n, 10).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const expanded =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgb(${r},${g},${b})`;
}

export function tintFrom(rgb: string, mix = 0.86): string {
  const m = rgb.match(/\d+/g);
  if (!m) {
    return 'rgb(240,240,240)';
  }
  const [r, g, b] = m.slice(0, 3).map(Number);
  const tr = Math.round((r ?? 0) + (255 - (r ?? 0)) * mix);
  const tg = Math.round((g ?? 0) + (255 - (g ?? 0)) * mix);
  const tb = Math.round((b ?? 0) + (255 - (b ?? 0)) * mix);
  return `rgb(${tr},${tg},${tb})`;
}

const isOccupied = (
  blockList: AppTile[],
  col: number,
  row: number,
  w: number,
  h: number,
  excludeId: number,
): boolean => {
  for (const b of blockList) {
    if (b.id === excludeId) {
      continue;
    }
    if (col < b.col + b.w && col + w > b.col && row < b.row + b.h && row + h > b.row) {
      return true;
    }
  }
  return false;
};

const canPlace = (blockList: AppTile[], col: number, row: number, w: number, h: number, excludeId: number): boolean => {
  if (col < 0 || row < 0 || col + w > COLS) {
    return false;
  }
  return !isOccupied(blockList, col, row, w, h, excludeId);
};

const computeNewBlock = (block: AppTile, mx: number, my: number, rectWidth: number, handle: ResizeHandle): AppTile => {
  const cellW = (rectWidth + GAP) / COLS;
  const cellH = CELL + GAP;
  const newW = Math.max(1, Math.min(COLS - block.col, Math.round((mx - block.col * cellW) / cellW)));
  const newH = Math.max(1, Math.round((my - block.row * cellH) / cellH));

  if (handle === 'right') {
    return { ...block, w: newW };
  }
  if (handle === 'bottom') {
    return { ...block, h: newH };
  }
  return { ...block, w: newW, h: newH };
};

export type AppManagementViewModel = {
  blocks: AppTile[];
  selectedId: number;
  sel: AppTile;
  rows: number;
  gridW: number;
  isDragging: boolean;
  movingBlockId: number | null;
  movePreview: MovePreview | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
  selectBlock: (id: number) => void;
  addBlock: () => void;
  removeBlock: (id: number) => void;
  resetBlocks: () => void;
  setBlockProp: <K extends keyof AppTile>(key: K, val: AppTile[K]) => void;
  handleResizeStart: (blockId: number, handle: ResizeHandle) => void;
  handleMoveStart: (blockId: number, mouseX: number, mouseY: number) => void;
};

export function useAppManagementPage(): AppManagementViewModel {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<AppTile[]>(initBlocks);
  const [selectedId, setSelectedId] = useState(0);
  const [resizeDragInfo, setResizeDragInfo] = useState<ResizeDragInfo | null>(null);
  const [moveDragInfo, setMoveDragInfo] = useState<MoveDragInfo | null>(null);
  const [movePreview, setMovePreview] = useState<MovePreview | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  // Refs for non-stale access inside event handlers
  const blocksRef = useRef(blocks);
  const movePreviewRef = useRef<MovePreview | null>(null);
  blocksRef.current = blocks;

  const sel = blocks.find((b) => b.id === selectedId) ?? blocks[0] ?? initBlocks()[0];
  const rows = blocks.length > 0 ? Math.max(3, ...blocks.map((b) => b.row + b.h)) : 3;
  const gridW = COLS * CELL + (COLS - 1) * GAP;

  const setBlockProp = useCallback(
    <K extends keyof AppTile>(key: K, val: AppTile[K]) => {
      setBlocks((prev) => prev.map((b) => (b.id === selectedId ? { ...b, [key]: val } : b)));
    },
    [selectedId],
  );

  // ── Resize drag ──────────────────────────────────────────────────────────
  const handleResizeStart = useCallback((blockId: number, handle: ResizeHandle) => {
    if (!gridRef.current) {
      return;
    }
    setResizeDragInfo({ blockId, handle, rect: gridRef.current.getBoundingClientRect() });
  }, []);

  useEffect(() => {
    if (!resizeDragInfo) {
      return;
    }
    const { blockId, handle, rect } = resizeDragInfo;

    const onMove = (e: MouseEvent) => {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === blockId);
        if (idx === -1) {
          return prev;
        }
        const block = prev[idx] as AppTile;
        const candidate = computeNewBlock(block, mx, my, rect.width, handle);
        if (!canPlace(prev, candidate.col, candidate.row, candidate.w, candidate.h, blockId)) {
          return prev;
        }
        const next = [...prev];
        next[idx] = candidate;
        return next;
      });
    };

    const onUp = () => setResizeDragInfo(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizeDragInfo]);

  // ── Move drag ────────────────────────────────────────────────────────────
  const handleMoveStart = useCallback(
    (blockId: number, mouseX: number, mouseY: number) => {
      if (!gridRef.current || resizeDragInfo) {
        return;
      }
      const rect = gridRef.current.getBoundingClientRect();
      const block = blocks.find((b) => b.id === blockId);
      if (!block) {
        return;
      }
      const offsetX = mouseX - rect.left - block.col * (CELL + GAP);
      const offsetY = mouseY - rect.top - block.row * (CELL + GAP);

      const initial: MovePreview = { col: block.col, row: block.row, activated: false };
      movePreviewRef.current = initial;
      setMovePreview(initial);
      setMoveDragInfo({
        blockId,
        rect,
        offsetX,
        offsetY,
        startX: mouseX,
        startY: mouseY,
        blockW: block.w,
        blockH: block.h,
      });
    },
    [blocks, resizeDragInfo],
  );

  useEffect(() => {
    if (!moveDragInfo) {
      return;
    }
    const { blockId, rect, offsetX, offsetY, startX, startY, blockW, blockH } = moveDragInfo;

    const onMove = (e: MouseEvent) => {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const rawCol = Math.max(0, Math.min(COLS - blockW, Math.round((mx - offsetX) / (CELL + GAP))));
      const rawRow = Math.max(0, Math.round((my - offsetY) / (CELL + GAP)));

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const activated = Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;

      if (canPlace(blocksRef.current, rawCol, rawRow, blockW, blockH, blockId)) {
        const preview: MovePreview = { col: rawCol, row: rawRow, activated };
        movePreviewRef.current = preview;
        setMovePreview(preview);
      } else if (activated !== movePreviewRef.current?.activated) {
        const prev = movePreviewRef.current;
        const preview: MovePreview = { col: prev?.col ?? rawCol, row: prev?.row ?? rawRow, activated };
        movePreviewRef.current = preview;
        setMovePreview(preview);
      }
    };

    const onUp = () => {
      const preview = movePreviewRef.current;
      if (preview?.activated) {
        setBlocks((prev) => {
          const block = prev.find((b) => b.id === blockId);
          if (!block) {
            return prev;
          }
          if (preview.col === block.col && preview.row === block.row) {
            return prev;
          }
          if (!canPlace(prev, preview.col, preview.row, blockW, blockH, blockId)) {
            return prev;
          }
          return prev.map((b) => (b.id === blockId ? { ...b, col: preview.col, row: preview.row } : b));
        });
      }
      movePreviewRef.current = null;
      setMovePreview(null);
      setMoveDragInfo(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [moveDragInfo]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addBlock = useCallback(() => {
    const maxRow = Math.max(0, ...blocks.map((b) => b.row + b.h)) + 1;
    const positions = Array.from({ length: maxRow }, (_row, rowIdx) =>
      Array.from({ length: COLS }, (_col, colIdx) => ({ r: rowIdx, c: colIdx })),
    ).flat();
    const freePos = positions.find(({ r, c }) => canPlace(blocks, c, r, 1, 1, -1));
    if (!freePos) {
      return;
    }
    const newId = Math.max(...blocks.map((b) => b.id), -1) + 1;
    setBlocks([
      ...blocks,
      {
        id: newId,
        col: freePos.c,
        row: freePos.r,
        w: 1,
        h: 1,
        icon: 'none',
        title: t('appManagement.newTileTitle'),
        link: 'Link',
        fg: 'rgb(35,116,224)',
      },
    ]);
    setSelectedId(newId);
  }, [blocks, t]);

  const removeBlock = useCallback(
    (id: number) => {
      if (blocks.length <= 1) {
        return;
      }
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedId === id) {
        const remaining = blocks.filter((b) => b.id !== id);
        setSelectedId(remaining[0]?.id ?? 0);
      }
    },
    [blocks, selectedId],
  );

  const resetBlocks = useCallback(() => {
    setBlocks(initBlocks());
    setSelectedId(0);
  }, []);

  return {
    blocks,
    selectedId,
    sel,
    rows,
    gridW,
    isDragging: !!(resizeDragInfo || moveDragInfo),
    movingBlockId: moveDragInfo?.blockId ?? null,
    movePreview,
    gridRef,
    selectBlock: setSelectedId,
    addBlock,
    removeBlock,
    resetBlocks,
    setBlockProp,
    handleResizeStart,
    handleMoveStart,
  };
}
