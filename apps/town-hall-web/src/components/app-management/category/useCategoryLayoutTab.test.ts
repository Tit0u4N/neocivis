// @ts-nocheck

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('@/stores/config.store', () => ({
  useConfigStore: (sel: (s: { defaultLocale: string }) => unknown) => sel({ defaultLocale: 'fr' }),
}));

const mockConfigService = {
  getMunicipalityConfig: vi.fn(),
  setCategories: vi.fn(),
};

vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ config: mockConfigService }),
}));

import { initBlocks, tileToCategory, useCategoryLayoutTab } from './useCategoryLayoutTab';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORIES_STUB = initBlocks().map(tileToCategory);

function makeConfig(categories = CATEGORIES_STUB) {
  return { categories, carousel: [] };
}

// ---------------------------------------------------------------------------
// Initial load
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — initial load', () => {
  it('starts with isLoading=true then resolves tiles', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
    const { result } = renderHook(() => useCategoryLayoutTab());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.blocks).toHaveLength(CATEGORIES_STUB.length);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveError).toBeNull();
  });

  it('falls back to initBlocks when API returns empty categories', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig([]));
    const { result } = renderHook(() => useCategoryLayoutTab());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.blocks).toHaveLength(initBlocks().length);
  });

  it('falls back to initBlocks when getMunicipalityConfig throws', async () => {
    mockConfigService.getMunicipalityConfig.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useCategoryLayoutTab());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // keeps default blocks from useState initialiser
    expect(result.current.blocks.length).toBeGreaterThan(0);
  });

  it('first selected block is the first tile', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
    const { result } = renderHook(() => useCategoryLayoutTab());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedId).toBe(result.current.blocks[0].id);
  });
});

// ---------------------------------------------------------------------------
// saveConfig
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — saveConfig', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('calls setCategories with current blocks', async () => {
    mockConfigService.setCategories.mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveConfig();
    });

    expect(mockConfigService.setCategories).toHaveBeenCalledWith(result.current.blocks.map(tileToCategory));
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveError).toBeNull();
  });

  it('sets saveError when setCategories throws', async () => {
    mockConfigService.setCategories.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveConfig();
    });

    expect(result.current.saveError).not.toBeNull();
    expect(result.current.isSaving).toBe(false);
  });

  it('clears previous saveError on next successful save', async () => {
    mockConfigService.setCategories.mockRejectedValueOnce(new Error('err')).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveConfig();
    });
    expect(result.current.saveError).not.toBeNull();

    await act(async () => {
      await result.current.saveConfig();
    });
    expect(result.current.saveError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// selectBlock
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — selectBlock', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('changes selectedId', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const secondId = result.current.blocks[1].id;
    act(() => result.current.selectBlock(secondId));

    expect(result.current.selectedId).toBe(secondId);
    expect(result.current.sel.id).toBe(secondId);
  });
});

// ---------------------------------------------------------------------------
// addBlock
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — addBlock', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('adds a new block and selects it', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const prevCount = result.current.blocks.length;
    act(() => result.current.addBlock());

    expect(result.current.blocks).toHaveLength(prevCount + 1);
    const newId = result.current.selectedId;
    expect(result.current.blocks.find((b) => b.id === newId)).toBeDefined();
  });

  it('new block has default locale translation', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addBlock());

    const newBlock = result.current.blocks.find((b) => b.id === result.current.selectedId);
    expect(newBlock?.translations.some((tr) => tr.locale === 'fr')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// removeBlock
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — removeBlock', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('removes a block by id', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const idToRemove = result.current.blocks[1].id;
    const prevCount = result.current.blocks.length;
    act(() => result.current.removeBlock(idToRemove));

    expect(result.current.blocks).toHaveLength(prevCount - 1);
    expect(result.current.blocks.find((b) => b.id === idToRemove)).toBeUndefined();
  });

  it('does not remove when only 1 block remains', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig([CATEGORIES_STUB[0]]));
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.removeBlock(result.current.blocks[0].id));

    expect(result.current.blocks).toHaveLength(1);
  });

  it('selects first remaining block when selected block is removed', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const firstId = result.current.blocks[0].id;
    act(() => result.current.selectBlock(firstId));
    act(() => result.current.removeBlock(firstId));

    expect(result.current.selectedId).not.toBe(firstId);
    expect(result.current.blocks.find((b) => b.id === result.current.selectedId)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// resetBlocks
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — resetBlocks', () => {
  it('restores initBlocks and selects "alaune"', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addBlock());
    act(() => result.current.resetBlocks());

    expect(result.current.blocks).toHaveLength(initBlocks().length);
    expect(result.current.selectedId).toBe('alaune');
  });
});

// ---------------------------------------------------------------------------
// resetToData
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — resetToData', () => {
  it('replaces blocks with provided tiles', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const singleTile = [initBlocks()[0]];
    act(() => result.current.resetToData(singleTile));

    expect(result.current.blocks).toHaveLength(1);
    expect(result.current.selectedId).toBe(singleTile[0].id);
  });

  it('falls back to initBlocks when empty array provided', async () => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.resetToData([]));

    expect(result.current.blocks).toHaveLength(initBlocks().length);
  });
});

// ---------------------------------------------------------------------------
// setBlockProp
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — setBlockProp', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('updates color of selected block', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setBlockProp('color', '#123456'));

    expect(result.current.sel.color).toBe('#123456');
  });

  it('does not affect other blocks', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const originalColors = result.current.blocks.slice(1).map((b) => b.color);
    act(() => result.current.setBlockProp('color', '#AABBCC'));

    const afterColors = result.current.blocks.slice(1).map((b) => b.color);
    expect(afterColors).toEqual(originalColors);
  });

  it('updates icon of selected block', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setBlockProp('icon', 'Bell'));

    expect(result.current.sel.icon).toBe('Bell');
  });
});

// ---------------------------------------------------------------------------
// addLocaleToSelected / removeLocaleFromSelected / updateTranslationName
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — locale management', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('addLocaleToSelected adds missing locale', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Ensure 'es' is not present
    act(() => result.current.addLocaleToSelected('es' as any));

    expect(result.current.sel.translations.some((tr) => tr.locale === 'es')).toBe(true);
  });

  it('addLocaleToSelected is idempotent for existing locale', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const prevLen = result.current.sel.translations.length;
    const existingLocale = result.current.sel.translations[0].locale;
    act(() => result.current.addLocaleToSelected(existingLocale as any));

    expect(result.current.sel.translations).toHaveLength(prevLen);
  });

  it('removeLocaleFromSelected removes a non-default locale', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addLocaleToSelected('de' as any));
    const prevLen = result.current.sel.translations.length;

    act(() => result.current.removeLocaleFromSelected('de' as any));

    expect(result.current.sel.translations).toHaveLength(prevLen - 1);
    expect(result.current.sel.translations.some((tr) => tr.locale === 'de')).toBe(false);
  });

  it('removeLocaleFromSelected does not remove default locale (fr)', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const prevLen = result.current.sel.translations.length;
    act(() => result.current.removeLocaleFromSelected('fr' as any));

    expect(result.current.sel.translations).toHaveLength(prevLen);
  });

  it('updateTranslationName updates name for given locale', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.updateTranslationName('fr', 'Nouveau nom'));

    const frTranslation = result.current.sel.translations.find((tr) => tr.locale === 'fr');
    expect(frTranslation?.name).toBe('Nouveau nom');
  });
});

// ---------------------------------------------------------------------------
// Computed values
// ---------------------------------------------------------------------------

describe('useCategoryLayoutTab — computed values', () => {
  beforeEach(() => {
    mockConfigService.getMunicipalityConfig.mockResolvedValue(makeConfig());
  });

  it('rows is at least 3', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.rows).toBeGreaterThanOrEqual(3);
  });

  it('gridW equals COLS * CELL + (COLS-1) * GAP = 474', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // 3 * 150 + 2 * 12 = 474
    expect(result.current.gridW).toBe(474);
  });

  it('isDragging is false initially', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isDragging).toBe(false);
  });

  it('movingBlockId is null initially', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.movingBlockId).toBeNull();
  });

  it('movePreview is null initially', async () => {
    const { result } = renderHook(() => useCategoryLayoutTab());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.movePreview).toBeNull();
  });
});
