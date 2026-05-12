'use client';

import { cleanup, render, screen } from '@testing-library/react';
import type * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock internal sub-components so that DnD / selection context is not required.
vi.mock('./BlockDraggable', () => ({
  BlockDraggable: () => undefined,
}));

vi.mock('./BlockContextMenu', () => ({
  BlockContextMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock DnD providers so that the DndPlugin render helpers are no-ops.
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('react-dnd-html5-backend', () => ({ HTML5Backend: {} }));

import { PlateEditor } from './PlateEditor.impl';

afterEach(cleanup);

describe('PlateEditor', () => {
  it('renders the editor content area', () => {
    render(<PlateEditor />);
    // Plate renders the editor with role="textbox"
    expect(document.querySelector('[role="textbox"]')).not.toBeNull();
  });

  it('shows the formatting toolbar in edit mode', () => {
    render(<PlateEditor />);
    expect(screen.getByRole('toolbar')).toBeTruthy();
  });

  it('hides the formatting toolbar in readOnly mode', () => {
    render(<PlateEditor readOnly />);
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('applies a custom className to the outer wrapper', () => {
    const { container } = render(<PlateEditor className="my-custom-class" />);
    expect(container.querySelector('.my-custom-class')).not.toBeNull();
  });

  it('toolbar contains multiple formatting buttons', () => {
    render(<PlateEditor />);
    // Toolbar buttons use icon-only labels; tooltip text lives in Radix portals.
    // Verify that at least the mark buttons (bold/italic/underline/strikethrough) exist.
    const toolbar = screen.getByRole('toolbar');
    const buttons = toolbar.querySelectorAll('button');
    // 4 marks + 4 blocks + 2 lists + 3 insert = 13 buttons minimum
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('does not throw when a value prop is provided', () => {
    const value = [{ type: 'p', children: [{ text: 'Hello' }] }];
    expect(() => render(<PlateEditor value={value} />)).not.toThrow();
  });

  it('does not throw when an onChange handler is provided', () => {
    const onChange = vi.fn();
    expect(() => render(<PlateEditor onChange={onChange} />)).not.toThrow();
  });
});
