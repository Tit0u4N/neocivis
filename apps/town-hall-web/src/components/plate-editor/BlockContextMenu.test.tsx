'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock editor
// ---------------------------------------------------------------------------

const mockBlockSelection = {
  getNodes: vi.fn().mockReturnValue([]),
  focus: vi.fn(),
  set: vi.fn(),
  addOnContextMenu: vi.fn(),
};

const mockEditor = {
  getApi: vi.fn().mockReturnValue({ blockSelection: mockBlockSelection }),
  tf: {
    withoutNormalizing: vi.fn((fn: () => void) => fn()),
    removeNodes: vi.fn(),
    setNodes: vi.fn(),
    toggleBlock: vi.fn(),
  },
};

vi.mock('platejs/react', () => ({
  useEditorRef: () => mockEditor,
}));

import { BlockContextMenu } from './BlockContextMenu';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('BlockContextMenu', () => {
  it('renders its children', () => {
    render(
      <BlockContextMenu>
        <div data-testid="child">content</div>
      </BlockContextMenu>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('opens the context menu on right-click', () => {
    render(
      <BlockContextMenu>
        <div data-testid="trigger">content</div>
      </BlockContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    // Radix renders portal content into document.body
    expect(document.body.textContent).toContain('Supprimer');
  });

  it('shows "Transformer en..." sub-menu trigger', () => {
    render(
      <BlockContextMenu>
        <div data-testid="trigger">content</div>
      </BlockContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    expect(document.body.textContent).toContain('Transformer en');
  });

  it('calls removeNodes when Supprimer is selected and no blocks are selected', () => {
    mockBlockSelection.getNodes.mockReturnValue([]);

    render(
      <BlockContextMenu>
        <div data-testid="trigger">content</div>
      </BlockContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger'));

    const deleteItem = screen.getByText('Supprimer');
    fireEvent.click(deleteItem);

    expect(mockEditor.tf.removeNodes).toHaveBeenCalled();
  });

  it('calls removeNodes for each selected block in reverse order when blocks are selected', () => {
    const path1 = [0];
    const path2 = [1];
    mockBlockSelection.getNodes.mockReturnValue([
      [{ type: 'p', children: [] }, path1],
      [{ type: 'p', children: [] }, path2],
    ]);

    render(
      <BlockContextMenu>
        <div data-testid="trigger">content</div>
      </BlockContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByText('Supprimer'));

    // withoutNormalizing is called
    expect(mockEditor.tf.withoutNormalizing).toHaveBeenCalled();
    // removeNodes called twice (once per selected block)
    expect(mockEditor.tf.removeNodes).toHaveBeenCalledTimes(2);
  });

  it('hides the menu after an item is selected', () => {
    mockBlockSelection.getNodes.mockReturnValue([]);

    render(
      <BlockContextMenu>
        <div data-testid="trigger">content</div>
      </BlockContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    expect(screen.queryByText('Supprimer')).not.toBeNull();
    fireEvent.click(screen.getByText('Supprimer'));
    // After selection, Radix closes the menu
    expect(screen.queryByText('Supprimer')).toBeNull();
  });
});
