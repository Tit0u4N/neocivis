// @ts-nocheck

'use client';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/features/app-management/category/TileGrid', () => ({
  TileGrid: () => <div data-testid="tile-grid" />,
}));

vi.mock('@/features/app-management/category/IconPickerModal', () => ({
  IconPickerModal: () => <div data-testid="icon-picker-modal" />,
}));

vi.mock('@/features/app-management/LinkPicker', () => ({
  LinkPicker: () => <div data-testid="link-picker" />,
}));

const mockSel = {
  id: 'b1',
  col: 0,
  row: 0,
  colSpan: 2,
  rowSpan: 1,
  color: '#ffffff',
  iconName: 'home',
  linkUrl: '',
  translations: [{ locale: 'fr', name: 'Accueil' }],
};

const mockVm = {
  blocks: [mockSel],
  selectedId: 'b1',
  sel: mockSel,
  rows: 4,
  gridW: 4,
  isDragging: false,
  movingBlockId: null,
  movePreview: null,
  gridRef: { current: null },
  isLoading: false,
  isSaving: false,
  saveError: null,
  saveConfig: vi.fn(),
  selectBlock: vi.fn(),
  addBlock: vi.fn(),
  removeBlock: vi.fn(),
  resetBlocks: vi.fn(),
  resetToData: vi.fn(),
  setBlockProp: vi.fn(),
  addLocaleToSelected: vi.fn(),
  removeLocaleFromSelected: vi.fn(),
  updateTranslationName: vi.fn(),
  handleResizeStart: vi.fn(),
  handleMoveStart: vi.fn(),
};

vi.mock('./useCategoryLayoutTab', () => ({
  useCategoryLayoutTab: () => mockVm,
  COLOR_PRESETS: [
    { name: 'Corail', color: '#F44528', bg: 'rgb(255,229,224)' },
    { name: 'Azur', color: '#2374E0', bg: 'rgb(225,235,250)' },
  ],
  LINK_GROUPS: [],
  COLS: 3,
  CELL: 150,
  GAP: 12,
  tintFrom: (hex: string) => hex,
  initBlocks: () => [],
  categoryToTile: (c: unknown) => c,
  tileToCategory: (t: unknown) => t,
}));

import { CategoryLayoutTab } from './CategoryLayoutTab';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CategoryLayoutTab', () => {
  it('renders the tile grid', () => {
    render(<CategoryLayoutTab />);
    expect(screen.getByTestId('tile-grid')).toBeTruthy();
  });

  it('renders the settings panel title', () => {
    render(<CategoryLayoutTab />);
    expect(screen.getByText('appManagement.settings.title')).toBeTruthy();
  });

  it('shows loading state while isLoading', () => {
    mockVm.isLoading = true;
    render(<CategoryLayoutTab />);
    expect(screen.getByText('appManagement.loading')).toBeTruthy();
    mockVm.isLoading = false;
  });

  it('shows the hint text', () => {
    render(<CategoryLayoutTab />);
    expect(screen.getByText('appManagement.hint')).toBeTruthy();
  });
});
