'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/providers/ApiProvider', () => ({
  useApi: () => ({}),
}));

const mockEstablishmentService = {
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
vi.mock('@repo/frontend-services/establishment', () => ({
  // biome-ignore lint/style/useNamingConvention: React class name in mock object
  EstablishmentService: vi.fn(function (this: any) {
    return mockEstablishmentService;
  }),
}));

const mockUploadService = {
  uploadImage: vi.fn(),
};
vi.mock('@repo/frontend-services/upload', () => ({
  // biome-ignore lint/style/useNamingConvention: React class name in mock object
  UploadService: vi.fn(function (this: any) {
    return mockUploadService;
  }),
}));

import { useEstablishmentFormPage } from './useEstablishmentFormPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ESTABLISHMENT = {
  id: 'est-1',
  name: 'Mairie principale',
  type: 'town_hall' as const,
  address: '1 Place du Général de Gaulle',
  hours: 'Lun-Ven 8h-17h',
  phone: '04 93 32 80 00',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useEstablishmentFormPage', () => {
  it('starts with empty fields and no errors in create mode', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.name).toBe('');
    expect(result.current.form.address).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });

  it('loads establishment data in edit mode', async () => {
    mockEstablishmentService.getById.mockResolvedValue(ESTABLISHMENT);
    const { result } = renderHook(() => useEstablishmentFormPage('est-1'));

    expect(result.current.isEditing).toBe(true);
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.form.name).toBe('Mairie principale');
    expect(result.current.form.address).toBe('1 Place du Général de Gaulle');
  });

  it('sets apiError when getById throws in edit mode', async () => {
    mockEstablishmentService.getById.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useEstablishmentFormPage('est-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.apiError).not.toBeNull();
  });

  it('setField updates the form and marks it as dirty', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => result.current.setField('name', 'Nouvelle mairie'));

    expect(result.current.form.name).toBe('Nouvelle mairie');
    expect(result.current.isDirty).toBe(true);
  });

  it('handleSubmit shows validation errors when required fields are empty', async () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.address).toBeDefined();
    expect(result.current.errors.hours).toBeDefined();
    expect(result.current.errors.phone).toBeDefined();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handleSubmit calls create and redirects in create mode', async () => {
    mockEstablishmentService.create.mockResolvedValue(ESTABLISHMENT);
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => {
      result.current.setField('name', 'Nouvelle mairie');
      result.current.setField('address', '1 rue de la Paix');
      result.current.setField('hours', 'Lun-Ven 9h-17h');
      result.current.setField('phone', '01 02 03 04 05');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockEstablishmentService.create).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
  });

  it('handleSubmit calls update and redirects in edit mode', async () => {
    mockEstablishmentService.getById.mockResolvedValue(ESTABLISHMENT);
    mockEstablishmentService.update.mockResolvedValue(ESTABLISHMENT);
    const { result } = renderHook(() => useEstablishmentFormPage('est-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockEstablishmentService.update).toHaveBeenCalledWith('est-1', expect.any(Object));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
  });

  it('handleCancel navigates away directly when the form is not dirty', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => result.current.handleCancel());

    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
    expect(result.current.showDiscardDialog).toBe(false);
  });

  it('handleCancel opens the discard dialog when the form is dirty', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => result.current.setField('name', 'Modifié'));
    act(() => result.current.handleCancel());

    expect(result.current.showDiscardDialog).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('confirmDiscard closes the dialog and navigates away', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => result.current.setField('name', 'Modifié'));
    act(() => result.current.handleCancel());
    act(() => result.current.confirmDiscard());

    expect(result.current.showDiscardDialog).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
  });
});
