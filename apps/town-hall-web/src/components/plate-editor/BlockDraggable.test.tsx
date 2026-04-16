'use client';

import { renderHook } from '@testing-library/react';
import { KEYS } from 'platejs';
import { describe, expect, it, vi } from 'vitest';
import { BlockDraggable } from './BlockDraggable';

// ---------------------------------------------------------------------------
// Minimal editor mock
// ---------------------------------------------------------------------------

function makeEditor(readOnly = false) {
  return {
    dom: { readOnly },
    api: {
      some: vi.fn().mockReturnValue(false),
      blocks: vi.fn().mockReturnValue([]),
    },
    // Return key as-is so isType comparisons work with the real KEYS constants.
    getType: (key: string) => key,
    getApi: vi.fn().mockReturnValue({
      blockSelection: {
        getNodes: vi.fn().mockReturnValue([]),
        set: vi.fn(),
        addOnContextMenu: vi.fn(),
      },
    }),
    tf: {
      removeNodes: vi.fn(),
    },
  };
}

function makeElement(type: string) {
  return { id: 'test-id', type, children: [{ text: '' }] };
}

// ---------------------------------------------------------------------------
// BlockDraggable is a RenderNodeWrapper that uses React.useMemo internally.
// It must be invoked within a React rendering context — renderHook provides it.
// ---------------------------------------------------------------------------

describe('BlockDraggable', () => {
  it('returns undefined for a readOnly editor', () => {
    const editor = makeEditor(true);
    const element = makeElement(KEYS.p);
    // @ts-expect-error minimal editor mock
    const { result } = renderHook(() => BlockDraggable({ editor, element, path: [0] }));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined for undraggable element type "tr" at depth 1', () => {
    const editor = makeEditor(false);
    const element = makeElement(KEYS.tr);
    // @ts-expect-error minimal editor mock
    const { result } = renderHook(() => BlockDraggable({ editor, element, path: [0] }));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined for undraggable element type "td"', () => {
    const editor = makeEditor(false);
    const element = makeElement(KEYS.td);
    // @ts-expect-error minimal editor mock
    const { result } = renderHook(() => BlockDraggable({ editor, element, path: [0] }));
    expect(result.current).toBeUndefined();
  });

  it('returns a component for a paragraph at top level (path.length === 1)', () => {
    const editor = makeEditor(false);
    const element = makeElement(KEYS.p);
    // @ts-expect-error minimal editor mock
    const { result } = renderHook(() => BlockDraggable({ editor, element, path: [0] }));
    expect(typeof result.current).toBe('function');
  });

  it('returns a component for a heading at top level', () => {
    const editor = makeEditor(false);
    const element = makeElement(KEYS.h1);
    // @ts-expect-error minimal editor mock
    const { result } = renderHook(() => BlockDraggable({ editor, element, path: [0] }));
    expect(typeof result.current).toBe('function');
  });

  it('returns undefined for path.length === 2 (not top-level, not table/column context)', () => {
    const editor = makeEditor(false);
    const element = makeElement(KEYS.p);
    // @ts-expect-error minimal editor mock
    const { result } = renderHook(() => BlockDraggable({ editor, element, path: [0, 0] }));
    expect(result.current).toBeUndefined();
  });
});
