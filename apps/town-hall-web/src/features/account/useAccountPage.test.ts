'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUserService = {
  getMe: vi.fn(),
  updateMe: vi.fn(),
  changePassword: vi.fn(),
};
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ userService: mockUserService }),
}));

const mockLogout = vi.fn();
vi.mock('@/hooks/useAuthentication', () => ({
  useAuthentication: () => ({ logout: mockLogout }),
}));

import { useAccountPage } from './useAccountPage';

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER = {
  id: 1,
  firstName: 'Jean',
  lastName: 'Dupont',
  username: 'jean.dupont',
  email: 'jean@mairie.fr',
  role: 'EMPLOYEE' as const,
  city: undefined,
  memberships: [],
  permissions: [],
  roles: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAccountPage', () => {
  describe('chargement initial', () => {
    it('est en chargement puis remplit le formulaire depuis getMe', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.form.firstName).toBe('Jean');
      expect(result.current.form.lastName).toBe('Dupont');
      expect(result.current.form.username).toBe('jean.dupont');
      expect(result.current.form.email).toBe('jean@mairie.fr');
    });

    it('set loadError quand getMe échoue', async () => {
      mockUserService.getMe.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useAccountPage());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.loadError).not.toBeNull();
    });

    it('commence sans dialog ouverte ni erreur', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.editingField).toBeNull();
      expect(result.current.editingError).toBeNull();
      expect(result.current.loadError).toBeNull();
    });
  });

  describe('openEditField / closeEditField', () => {
    it('openEditField initialise editingField et editingValue avec la valeur actuelle', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));

      expect(result.current.editingField).toBe('firstName');
      expect(result.current.editingValue).toBe('Jean');
      expect(result.current.editingError).toBeNull();
    });

    it('closeEditField ferme la dialog et réinitialise les états', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('email'));
      act(() => result.current.closeEditField());

      expect(result.current.editingField).toBeNull();
      expect(result.current.editingValue).toBe('');
    });

    it('setEditingValue met à jour editingValue', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));
      act(() => result.current.setEditingValue('Pierre'));

      expect(result.current.editingValue).toBe('Pierre');
    });
  });

  describe('confirmEditField — validation', () => {
    it('rejette un username trop court et ne call pas updateMe', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('username'));
      act(() => result.current.setEditingValue('ab'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(mockUserService.updateMe).not.toHaveBeenCalled();
      expect(result.current.editingField).toBe('username');
    });

    it('rejette un email invalide et ne call pas updateMe', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('email'));
      act(() => result.current.setEditingValue('pas-un-email'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(mockUserService.updateMe).not.toHaveBeenCalled();
    });
  });

  describe('confirmEditField — succès', () => {
    it('appelle updateMe uniquement avec le champ modifié', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      mockUserService.updateMe.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));
      act(() => result.current.setEditingValue('Pierre'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(mockUserService.updateMe).toHaveBeenCalledWith({ firstName: 'Pierre' });
    });

    it('met à jour form et ferme la dialog après succès', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      mockUserService.updateMe.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('lastName'));
      act(() => result.current.setEditingValue('Martin'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.form.lastName).toBe('Martin');
      expect(result.current.editingField).toBeNull();
      expect(result.current.editingError).toBeNull();
    });
  });

  describe('confirmEditField — erreur', () => {
    it('set editingError et laisse la dialog ouverte quand updateMe échoue', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      mockUserService.updateMe.mockRejectedValue(new Error('Server error'));
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('username'));
      act(() => result.current.setEditingValue('nouveau.login'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(result.current.editingField).toBe('username');
    });
  });

  describe('dialog mot de passe', () => {
    it('openPasswordDialog ouvre la dialog', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordDialog());
      expect(result.current.passwordDialogOpen).toBe(true);
    });

    it('closePasswordDialog ferme la dialog', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordDialog());
      act(() => result.current.closePasswordDialog());
      expect(result.current.passwordDialogOpen).toBe(false);
    });

    it("confirmPasswordReset ferme la dialog et set passwordSuccess avec l'email", async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      mockUserService.changePassword.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordDialog());
      await act(async () => {
        await result.current.confirmPasswordReset();
      });

      expect(mockUserService.changePassword).toHaveBeenCalled();
      expect(result.current.passwordDialogOpen).toBe(false);
      expect(result.current.passwordSuccess).not.toBeNull();
      expect(result.current.passwordSuccess).toContain('jean@mairie.fr');
      expect(result.current.passwordError).toBeNull();
    });

    it('confirmPasswordReset set passwordError et laisse la dialog ouverte quand changePassword échoue', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      mockUserService.changePassword.mockRejectedValue(new Error('SMTP error'));
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordDialog());
      await act(async () => {
        await result.current.confirmPasswordReset();
      });

      expect(result.current.passwordError).not.toBeNull();
      expect(result.current.passwordDialogOpen).toBe(true);
      expect(result.current.passwordSuccess).toBeNull();
    });

    it('openPasswordDialog réinitialise passwordError et passwordSuccess', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      mockUserService.changePassword.mockRejectedValue(new Error('SMTP error'));
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordDialog());
      await act(async () => {
        await result.current.confirmPasswordReset();
      });
      expect(result.current.passwordError).not.toBeNull();

      act(() => result.current.openPasswordDialog());
      expect(result.current.passwordError).toBeNull();
      expect(result.current.passwordSuccess).toBeNull();
    });
  });

  describe('handleLogout', () => {
    it('appelle logout', async () => {
      mockUserService.getMe.mockResolvedValue(USER);
      const { result } = renderHook(() => useAccountPage());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleLogout());
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
