'use client';

import type { Category, CategoryTranslation } from '@repo/contracts/config';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '@/providers/ServicesProvider';
import { type Locale, useConfigStore } from '@/stores/config.store';

export type { LinkGroupId, TileLinkType } from '../LinkPicker';
export { LINK_GROUPS } from '../LinkPicker';

export type ResizeHandle = 'right' | 'bottom' | 'br';

export type AppTile = {
  id: string;
  col: number;
  row: number;
  colSpan: 1 | 2 | 3;
  rowSpan: 1 | 2 | 3;
  icon: string;
  color: string;
  link: { type: string; id?: string };
  translations: CategoryTranslation[];
};

export type ColorPreset = {
  name: string;
  color: string;
  bg: string;
};

export type MovePreview = {
  col: number;
  row: number;
  activated: boolean;
};

type ResizeDragInfo = {
  blockId: string;
  handle: ResizeHandle;
  rect: DOMRect;
};

type MoveDragInfo = {
  blockId: string;
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

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Corail', color: '#F44528', bg: 'rgb(255,229,224)' },
  { name: 'Azur', color: '#2374E0', bg: 'rgb(225,235,250)' },
  { name: 'Ambre', color: '#E78C1C', bg: 'rgb(253,233,206)' },
  { name: 'Ardoise', color: '#667080', bg: 'rgb(228,231,236)' },
  { name: 'Forêt', color: '#229449', bg: 'rgb(218,238,224)' },
  { name: 'Violet', color: '#7C4FD9', bg: 'rgb(231,222,247)' },
];

const defaultTranslations = (defaultLocale: Locale, name: string): CategoryTranslation[] => [
  { locale: defaultLocale, name },
];

export const initBlocks = (): AppTile[] => [
  {
    id: 'alaune',
    col: 0,
    row: 0,
    colSpan: 2,
    rowSpan: 1,
    icon: 'Star',
    color: '#F44528',
    link: { type: 'Articles' },
    translations: [
      { locale: 'fr', name: 'À la Une' },
      { locale: 'en', name: 'Featured' },
      { locale: 'de', name: 'Aktuell' },
      { locale: 'it', name: 'In primo piano' },
    ],
  },
  {
    id: 'pratique',
    col: 2,
    row: 0,
    colSpan: 1,
    rowSpan: 1,
    icon: 'Info',
    color: '#2374E0',
    link: { type: 'General' },
    translations: [
      { locale: 'fr', name: 'Pratique' },
      { locale: 'en', name: 'Practical' },
      { locale: 'de', name: 'Praktisch' },
      { locale: 'it', name: 'Pratico' },
    ],
  },
  {
    id: 'urgence',
    col: 0,
    row: 1,
    colSpan: 1,
    rowSpan: 1,
    icon: 'TriangleAlert',
    color: '#E78C1C',
    link: { type: 'Reports' },
    translations: [
      { locale: 'fr', name: 'Urgence' },
      { locale: 'en', name: 'Emergency' },
      { locale: 'de', name: 'Notfall' },
      { locale: 'it', name: 'Emergenza' },
    ],
  },
  {
    id: 'travaux',
    col: 1,
    row: 1,
    colSpan: 2,
    rowSpan: 1,
    icon: 'Wrench',
    color: '#667080',
    link: { type: 'Reports' },
    translations: [
      { locale: 'fr', name: 'Travaux' },
      { locale: 'en', name: 'Works' },
      { locale: 'de', name: 'Baustellen' },
      { locale: 'it', name: 'Lavori' },
    ],
  },
  {
    id: 'sondage',
    col: 0,
    row: 2,
    colSpan: 1,
    rowSpan: 1,
    icon: 'BarChart2',
    color: '#229449',
    link: { type: 'Forum' },
    translations: [
      { locale: 'fr', name: 'Sondage' },
      { locale: 'en', name: 'Survey' },
      { locale: 'de', name: 'Umfrage' },
      { locale: 'it', name: 'Sondaggio' },
    ],
  },
  {
    id: 'divers',
    col: 1,
    row: 2,
    colSpan: 1,
    rowSpan: 1,
    icon: 'Globe',
    color: '#7C4FD9',
    link: { type: 'General' },
    translations: [
      { locale: 'fr', name: 'Divers' },
      { locale: 'en', name: 'Miscellaneous' },
      { locale: 'de', name: 'Sonstiges' },
      { locale: 'it', name: 'Varie' },
    ],
  },
];

export function tintFrom(hex: string, mix = 0.86): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) {
    return 'rgb(240,240,240)';
  }
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const tr = Math.round(r + (255 - r) * mix);
  const tg = Math.round(g + (255 - g) * mix);
  const tb = Math.round(b + (255 - b) * mix);
  return `rgb(${tr},${tg},${tb})`;
}

export const categoryToTile = (cat: Category): AppTile => ({
  id: cat.id,
  col: cat.col ?? 0,
  row: cat.row ?? 0,
  colSpan: (cat.colSpan ?? 1) as 1 | 2 | 3,
  rowSpan: (cat.rowSpan ?? 1) as 1 | 2 | 3,
  icon: cat.icon,
  color: cat.color,
  link: cat.link ?? { type: 'Link' },
  translations: cat.translations,
});

export const tileToCategory = (tile: AppTile): Category => ({
  id: tile.id,
  col: tile.col,
  row: tile.row,
  colSpan: tile.colSpan,
  rowSpan: tile.rowSpan,
  icon: tile.icon,
  color: tile.color,
  link: tile.link,
  translations: tile.translations,
});

const isOccupied = (
  blockList: AppTile[],
  col: number,
  row: number,
  w: number,
  h: number,
  excludeId: string,
): boolean => {
  for (const b of blockList) {
    if (b.id === excludeId) {
      continue;
    }
    if (col < b.col + b.colSpan && col + w > b.col && row < b.row + b.rowSpan && row + h > b.row) {
      return true;
    }
  }
  return false;
};

const canPlace = (blockList: AppTile[], col: number, row: number, w: number, h: number, excludeId: string): boolean => {
  if (col < 0 || row < 0 || col + w > COLS) {
    return false;
  }
  return !isOccupied(blockList, col, row, w, h, excludeId);
};

const computeNewBlock = (block: AppTile, mx: number, my: number, rectWidth: number, handle: ResizeHandle): AppTile => {
  const cellW = (rectWidth + GAP) / COLS;
  const cellH = CELL + GAP;
  const newW = Math.max(1, Math.min(COLS - block.col, Math.round((mx - block.col * cellW) / cellW))) as 1 | 2 | 3;
  const newH = Math.max(1, Math.round((my - block.row * cellH) / cellH)) as 1 | 2 | 3;

  if (handle === 'right') {
    return { ...block, colSpan: newW };
  }
  if (handle === 'bottom') {
    return { ...block, rowSpan: newH };
  }
  return { ...block, colSpan: newW, rowSpan: newH };
};

export type CategoryLayoutTabViewModel = {
  blocks: AppTile[];
  selectedId: string;
  sel: AppTile;
  rows: number;
  gridW: number;
  isDragging: boolean;
  movingBlockId: string | null;
  movePreview: MovePreview | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveConfig: () => Promise<void>;
  selectBlock: (id: string) => void;
  addBlock: () => void;
  removeBlock: (id: string) => void;
  resetBlocks: () => void;
  resetToData: (tiles: AppTile[]) => void;
  setBlockProp: <K extends keyof AppTile>(key: K, val: AppTile[K]) => void;
  addLocaleToSelected: (locale: Locale) => void;
  removeLocaleFromSelected: (locale: Locale) => void;
  updateTranslationName: (locale: Locale, name: string) => void;
  handleResizeStart: (blockId: string, handle: ResizeHandle) => void;
  handleMoveStart: (blockId: string, mouseX: number, mouseY: number) => void;
};

export function useCategoryLayoutTab(): CategoryLayoutTabViewModel {
  const { t } = useTranslation();
  const defaultLocale = useConfigStore((s) => s.defaultLocale);
  const { configService: configService } = useServices();

  const [blocks, setBlocks] = useState<AppTile[]>(initBlocks);
  const [selectedId, setSelectedId] = useState<string>('alaune');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resizeDragInfo, setResizeDragInfo] = useState<ResizeDragInfo | null>(null);
  const [moveDragInfo, setMoveDragInfo] = useState<MoveDragInfo | null>(null);
  const [movePreview, setMovePreview] = useState<MovePreview | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef(blocks);
  const movePreviewRef = useRef<MovePreview | null>(null);
  blocksRef.current = blocks;

  const sel = blocks.find((b) => b.id === selectedId) ?? blocks[0] ?? initBlocks()[0];
  const rows = blocks.length > 0 ? Math.max(3, ...blocks.map((b) => b.row + b.rowSpan)) : 3;
  const gridW = COLS * CELL + (COLS - 1) * GAP;

  const resetToData = useCallback((tiles: AppTile[]) => {
    const resolved = tiles.length > 0 ? tiles : initBlocks();
    setBlocks(resolved);
    setSelectedId(resolved[0]?.id ?? 'alaune');
  }, []);

  useEffect(() => {
    configService
      .getMunicipalityConfig()
      .then((data) => resetToData(data.categories.map(categoryToTile)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [configService, resetToData]);

  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await configService.setCategories(blocks.map(tileToCategory));
    } catch {
      setSaveError(t('appManagement.saveError'));
    } finally {
      setIsSaving(false);
    }
  }, [blocks, configService, t]);

  const setBlockProp = useCallback(
    <K extends keyof AppTile>(key: K, val: AppTile[K]) => {
      setBlocks((prev) => prev.map((b) => (b.id === selectedId ? { ...b, [key]: val } : b)));
    },
    [selectedId],
  );

  const addLocaleToSelected = useCallback(
    (locale: Locale) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedId && !b.translations.some((tr) => tr.locale === locale)
            ? { ...b, translations: [...b.translations, { locale, name: '' }] }
            : b,
        ),
      );
    },
    [selectedId],
  );

  const removeLocaleFromSelected = useCallback(
    (locale: Locale) => {
      if (locale === defaultLocale) {
        return;
      }
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedId ? { ...b, translations: b.translations.filter((tr) => tr.locale !== locale) } : b,
        ),
      );
    },
    [selectedId, defaultLocale],
  );

  const updateTranslationName = useCallback(
    (locale: Locale, name: string) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedId
            ? { ...b, translations: b.translations.map((tr) => (tr.locale === locale ? { ...tr, name } : tr)) }
            : b,
        ),
      );
    },
    [selectedId],
  );

  // ── Resize drag ──────────────────────────────────────────────────────────
  const handleResizeStart = useCallback((blockId: string, handle: ResizeHandle) => {
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
        if (!canPlace(prev, candidate.col, candidate.row, candidate.colSpan, candidate.rowSpan, blockId)) {
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
    (blockId: string, mouseX: number, mouseY: number) => {
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
        blockW: block.colSpan,
        blockH: block.rowSpan,
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
    const maxRow = Math.max(0, ...blocks.map((b) => b.row + b.rowSpan)) + 1;
    const positions = Array.from({ length: maxRow }, (_row, rowIdx) =>
      Array.from({ length: COLS }, (_col, colIdx) => ({ r: rowIdx, c: colIdx })),
    ).flat();
    const freePos = positions.find(({ r, c }) => canPlace(blocks, c, r, 1, 1, ''));
    if (!freePos) {
      return;
    }
    const newId = `tile-${Date.now()}`;
    setBlocks([
      ...blocks,
      {
        id: newId,
        col: freePos.c,
        row: freePos.r,
        colSpan: 1,
        rowSpan: 1,
        icon: 'none',
        color: '#2374E0',
        link: { type: 'General' },
        translations: defaultTranslations(defaultLocale, t('appManagement.newTileTitle')),
      },
    ]);
    setSelectedId(newId);
  }, [blocks, t, defaultLocale]);

  const removeBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) {
        return;
      }
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedId === id) {
        const remaining = blocks.filter((b) => b.id !== id);
        setSelectedId(remaining[0]?.id ?? '');
      }
    },
    [blocks, selectedId],
  );

  const resetBlocks = useCallback(() => {
    setBlocks(initBlocks());
    setSelectedId('alaune');
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
    isLoading,
    isSaving,
    saveError,
    saveConfig,
    selectBlock: setSelectedId,
    addBlock,
    removeBlock,
    resetBlocks,
    resetToData,
    setBlockProp,
    addLocaleToSelected,
    removeLocaleFromSelected,
    updateTranslationName,
    handleResizeStart,
    handleMoveStart,
  };
}
