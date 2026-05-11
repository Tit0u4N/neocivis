'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useEstablishmentFormPage } from './useEstablishmentFormPage';

afterEach(() => {
  vi.clearAllMocks();
});

describe('useEstablishmentFormPage', () => {
  it('starts with empty fields and no errors in create mode', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.name).toBe('');
    expect(result.current.form.address).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });

  it('flags isEditing when an id is passed', async () => {
    const { result } = renderHook(() => useEstablishmentFormPage('est-1'));
    expect(result.current.isEditing).toBe(true);
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('setField updates the form and clears the matching error', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => {
      result.current.setField('name', 'Nouvelle mairie');
    });

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

  it('handleSubmit redirects to the list when the form is valid', async () => {
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

    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
  });

  it('handleCancel navigates away directly when the form is not dirty', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => {
      result.current.handleCancel();
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
    expect(result.current.showDiscardDialog).toBe(false);
  });

  it('handleCancel opens the discard dialog when the form is dirty', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => {
      result.current.setField('name', 'Modifié');
    });
    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.showDiscardDialog).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('confirmDiscard closes the dialog and navigates away', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => {
      result.current.setField('name', 'Modifié');
    });
    act(() => {
      result.current.handleCancel();
    });
    act(() => {
      result.current.confirmDiscard();
    });

    expect(result.current.showDiscardDialog).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/establishment');
  });

  it('closeDiscardDialog hides the dialog without navigating', () => {
    const { result } = renderHook(() => useEstablishmentFormPage());

    act(() => {
      result.current.setField('name', 'Modifié');
    });
    act(() => {
      result.current.handleCancel();
    });
    act(() => {
      result.current.closeDiscardDialog();
    });

    expect(result.current.showDiscardDialog).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
