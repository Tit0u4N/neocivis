import { describe, expect, it } from 'vitest';
import { computeLayout } from '@/components/home/useCategoryLayout';
import type { Category } from '@/screens/city/useHomeScreen';

const cat = (id: string, overrides: Partial<Category> = {}): Category => ({
  id,
  name: id,
  icon: 'Star',
  color: '#000',
  ...overrides,
});

describe('computeLayout', () => {
  it('returns empty result for empty input', () => {
    const { placed, totalRows } = computeLayout([]);
    expect(placed).toHaveLength(0);
    expect(totalRows).toBe(0);
  });

  it('places tile at explicit (row, col)', () => {
    const { placed } = computeLayout([cat('a', { row: 0, col: 1 })]);
    expect(placed[0]).toMatchObject({ row: 0, col: 1, colSpan: 1, rowSpan: 1 });
  });

  it('places tiles without position in auto-flow', () => {
    const { placed, totalRows } = computeLayout([cat('a'), cat('b'), cat('c'), cat('d')]);
    expect(placed[0]).toMatchObject({ row: 0, col: 0 });
    expect(placed[1]).toMatchObject({ row: 0, col: 1 });
    expect(placed[2]).toMatchObject({ row: 0, col: 2 });
    expect(placed[3]).toMatchObject({ row: 1, col: 0 });
    expect(totalRows).toBe(2);
  });

  it('respects colSpan in explicit layout', () => {
    const { placed } = computeLayout([cat('wide', { row: 0, col: 0, colSpan: 2 }), cat('small', { row: 0, col: 2 })]);
    expect(placed[0]).toMatchObject({ col: 0, colSpan: 2 });
    expect(placed[1]).toMatchObject({ col: 2, colSpan: 1 });
  });

  it('respects rowSpan', () => {
    const { placed, totalRows } = computeLayout([
      cat('tall', { row: 0, col: 0, rowSpan: 2 }),
      cat('a', { row: 0, col: 1 }),
      cat('b', { row: 1, col: 1 }),
    ]);
    expect(placed[0]).toMatchObject({ row: 0, col: 0, rowSpan: 2 });
    expect(totalRows).toBe(2);
  });

  it('trims trailing empty rows', () => {
    // 3 tiles placed in row 0, row 1 stays empty
    const { totalRows } = computeLayout([
      cat('a', { row: 0, col: 0 }),
      cat('b', { row: 0, col: 1 }),
      cat('c', { row: 0, col: 2 }),
    ]);
    expect(totalRows).toBe(1);
  });

  it('does NOT show last row when it is empty (gap in middle)', () => {
    // Explicit positions: row 0 full, row 1 empty, row 2 one tile
    const { totalRows } = computeLayout([
      cat('a', { row: 0, col: 0 }),
      cat('b', { row: 0, col: 1 }),
      cat('c', { row: 0, col: 2 }),
      cat('d', { row: 2, col: 0 }),
    ]);
    expect(totalRows).toBe(3); // row 2 has content so last trimmed row = 2+1
  });

  it('falls back to auto-flow on overlap, subsequent tiles also auto-flow', () => {
    // 'a' takes (0,0). 'b' tries (0,0) again → overlap → fallback
    const { placed } = computeLayout([
      cat('a', { row: 0, col: 0 }),
      cat('b', { row: 0, col: 0 }), // overlap
      cat('c', { row: 0, col: 1 }), // subsequent: also auto-flow even if valid pos
    ]);
    // 'b' and 'c' must not conflict
    const positions = placed.map((p) => `${p.row},${p.col}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(placed.length);
  });

  it('falls back to auto-flow when tile goes out of bounds (col + colSpan > 3)', () => {
    const { placed } = computeLayout([
      cat('oob', { row: 0, col: 2, colSpan: 2 }), // col 2 + span 2 = 4 > 3
    ]);
    // Should be placed somewhere valid
    expect(placed[0].col + placed[0].colSpan).toBeLessThanOrEqual(3);
  });

  it('handles full 3x3 tile', () => {
    const { placed, totalRows } = computeLayout([cat('big', { row: 0, col: 0, colSpan: 3, rowSpan: 3 })]);
    expect(placed[0]).toMatchObject({ row: 0, col: 0, colSpan: 3, rowSpan: 3 });
    expect(totalRows).toBe(3);
  });
});
