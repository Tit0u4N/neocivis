import { useMemo } from 'react';
import type { Category } from '@/screens/city/useHomeScreen';

const GRID_COLS = 3;

export type Placed = {
  category: Category;
  row: number;
  col: number;
  colSpan: number;
  rowSpan: number;
};

export type LayoutResult = {
  placed: Placed[];
  totalRows: number;
};

export function computeLayout(categories: Category[]): LayoutResult {
  const occupied: boolean[][] = [];

  const ensureRow = (r: number) => {
    while (occupied.length <= r) {
      occupied.push([false, false, false]);
    }
  };

  const fits = (row: number, col: number, cs: number, rs: number): boolean => {
    if (col < 0 || col + cs > GRID_COLS || row < 0) {
      return false;
    }
    for (let r = row; r < row + rs; r++) {
      ensureRow(r);
      for (let c = col; c < col + cs; c++) {
        if (occupied[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  const occupy = (row: number, col: number, cs: number, rs: number) => {
    for (let r = row; r < row + rs; r++) {
      ensureRow(r);
      for (let c = col; c < col + cs; c++) {
        occupied[r][c] = true;
      }
    }
  };

  const findNextSlot = (cs: number, rs: number): { row: number; col: number } => {
    for (let r = 0; ; r++) {
      ensureRow(r);
      for (let c = 0; c <= GRID_COLS - cs; c++) {
        if (fits(r, c, cs, rs)) {
          return { row: r, col: c };
        }
      }
    }
  };

  let fallbackMode = false;
  const placed: Placed[] = [];

  for (const cat of categories) {
    const cs = Math.min(cat.colSpan ?? 1, GRID_COLS) as 1 | 2 | 3;
    const rs = cat.rowSpan ?? 1;
    const hasPos = typeof cat.row === 'number' && typeof cat.col === 'number';
    const positionValid = hasPos && fits(cat.row as number, cat.col as number, cs, rs);

    let row: number;
    let col: number;

    if (!fallbackMode && positionValid) {
      row = cat.row as number;
      col = cat.col as number;
    } else {
      if (hasPos && !fallbackMode) {
        fallbackMode = true;
      }
      const slot = findNextSlot(cs, rs);
      row = slot.row;
      col = slot.col;
    }

    occupy(row, col, cs, rs);
    placed.push({ category: cat, row, col, colSpan: cs, rowSpan: rs });
  }

  let totalRows = 0;
  for (let r = occupied.length - 1; r >= 0; r--) {
    if (occupied[r].some(Boolean)) {
      totalRows = r + 1;
      break;
    }
  }

  return { placed, totalRows };
}

export function useCategoryLayout(categories: Category[]): LayoutResult {
  return useMemo(() => computeLayout(categories), [categories]);
}
