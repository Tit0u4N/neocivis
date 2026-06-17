//@ts-nocheck
/** biome-ignore-all lint/suspicious/useAwait: TEST FILE */
/** biome-ignore-all lint/nursery/noShadow: vi.hoisted pattern */

import type { UserMeDto } from '@repo/contracts';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockGetMe, mockUpdateMe, mockChangePassword, mockUserService, mockLogout } = vi.hoisted(() => {
  const mockGetMe = vi.fn<[], Promise<UserMeDto>>();
  const mockUpdateMe = vi.fn();
  const mockChangePassword = vi.fn();
  const mockLogout = vi.fn();
  return {
    mockGetMe,
    mockUpdateMe,
    mockChangePassword,
    mockUserService: { getMe: mockGetMe, updateMe: mockUpdateMe, changePassword: mockChangePassword },
    mockLogout,
  };
});

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ userService: mockUserService }),
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const USER: UserMeDto = {
  id: 1,
  firstName: 'Jean',
  lastName: 'Dupont',
  username: 'jean.dupont',
  email: 'jean@ville.fr',
  role: 'CITIZEN',
  city: undefined,
  memberships: [],
  permissions: [],
  roles: [],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

afterEach(() => vi.clearAllMocks());

describe('useAccountScreen', () => {
  describe('chargement initial', () => {
    it('est en chargement puis remplit le formulaire depuis getMe', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.form.firstName).toBe('Jean');
      expect(result.current.form.lastName).toBe('Dupont');
      expect(result.current.form.username).toBe('jean.dupont');
      expect(result.current.form.email).toBe('jean@ville.fr');
    });

    it('set loadError quand getMe échoue', async () => {
      mockGetMe.mockRejectedValue(new Error('Network error'));
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.loadError).not.toBeNull();
    });

    it('commence sans sheet ouverte ni erreur', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.editingField).toBeNull();
      expect(result.current.editingError).toBeNull();
      expect(result.current.loadError).toBeNull();
      expect(result.current.passwordSheetOpen).toBe(false);
    });
  });

  describe('openEditField / closeEditField', () => {
    it('openEditField initialise editingField et editingValue avec la valeur actuelle', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));

      expect(result.current.editingField).toBe('firstName');
      expect(result.current.editingValue).toBe('Jean');
      expect(result.current.editingError).toBeNull();
    });

    it('closeEditField ferme la sheet et réinitialise les états', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('email'));
      act(() => result.current.closeEditField());

      expect(result.current.editingField).toBeNull();
      expect(result.current.editingValue).toBe('');
    });

    it('setEditingValue met à jour editingValue', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));
      act(() => result.current.setEditingValue('Pierre'));

      expect(result.current.editingValue).toBe('Pierre');
    });
  });

  describe('confirmEditField — validation', () => {
    it('rejette un username trop court et ne call pas updateMe', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('username'));
      act(() => result.current.setEditingValue('ab'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(mockUpdateMe).not.toHaveBeenCalled();
      expect(result.current.editingField).toBe('username');
    });

    it('rejette un email invalide et ne call pas updateMe', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('email'));
      act(() => result.current.setEditingValue('pas-un-email'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(mockUpdateMe).not.toHaveBeenCalled();
    });

    it('rejette un firstName vide', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));
      act(() => result.current.setEditingValue(''));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(mockUpdateMe).not.toHaveBeenCalled();
    });
  });

  describe('confirmEditField — succès', () => {
    it('appelle updateMe uniquement avec le champ modifié', async () => {
      mockGetMe.mockResolvedValue(USER);
      mockUpdateMe.mockResolvedValue({ success: true });
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('firstName'));
      act(() => result.current.setEditingValue('Pierre'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(mockUpdateMe).toHaveBeenCalledWith({ firstName: 'Pierre' });
    });

    it('met à jour form et ferme la sheet après succès', async () => {
      mockGetMe.mockResolvedValue(USER);
      mockUpdateMe.mockResolvedValue({ success: true });
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
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

    it("n'appelle updateMe qu'une seule fois par champ", async () => {
      mockGetMe.mockResolvedValue(USER);
      mockUpdateMe.mockResolvedValue({ success: true });
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('username'));
      act(() => result.current.setEditingValue('nouveau.user'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(mockUpdateMe).toHaveBeenCalledTimes(1);
      expect(mockUpdateMe).toHaveBeenCalledWith({ username: 'nouveau.user' });
    });
  });

  describe('confirmEditField — erreur API', () => {
    it('set editingError et laisse la sheet ouverte quand updateMe échoue', async () => {
      mockGetMe.mockResolvedValue(USER);
      mockUpdateMe.mockRejectedValue(new Error('Server error'));
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openEditField('username'));
      act(() => result.current.setEditingValue('valid.user'));
      await act(async () => {
        await result.current.confirmEditField();
      });

      expect(result.current.editingError).not.toBeNull();
      expect(result.current.editingField).toBe('username');
    });
  });

  describe('sheet mot de passe', () => {
    it('openPasswordSheet ouvre la sheet', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordSheet());
      expect(result.current.passwordSheetOpen).toBe(true);
    });

    it('closePasswordSheet ferme la sheet', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordSheet());
      act(() => result.current.closePasswordSheet());
      expect(result.current.passwordSheetOpen).toBe(false);
    });

    it("confirmPasswordReset ferme la sheet et set passwordSuccess avec l'email", async () => {
      mockGetMe.mockResolvedValue(USER);
      mockChangePassword.mockResolvedValue({ success: true });
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordSheet());
      await act(async () => {
        await result.current.confirmPasswordReset();
      });

      expect(mockChangePassword).toHaveBeenCalled();
      expect(result.current.passwordSheetOpen).toBe(false);
      expect(result.current.passwordSuccess).not.toBeNull();
      expect(result.current.passwordSuccess).toContain('jean@ville.fr');
      expect(result.current.passwordError).toBeNull();
    });

    it('confirmPasswordReset set passwordError et laisse la sheet ouverte quand changePassword échoue', async () => {
      mockGetMe.mockResolvedValue(USER);
      mockChangePassword.mockRejectedValue(new Error('SMTP error'));
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordSheet());
      await act(async () => {
        await result.current.confirmPasswordReset();
      });

      expect(result.current.passwordError).not.toBeNull();
      expect(result.current.passwordSheetOpen).toBe(true);
      expect(result.current.passwordSuccess).toBeNull();
    });

    it('openPasswordSheet réinitialise passwordError et passwordSuccess', async () => {
      mockGetMe.mockResolvedValue(USER);
      mockChangePassword.mockRejectedValue(new Error('SMTP error'));
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openPasswordSheet());
      await act(async () => {
        await result.current.confirmPasswordReset();
      });
      expect(result.current.passwordError).not.toBeNull();

      act(() => result.current.openPasswordSheet());
      expect(result.current.passwordError).toBeNull();
      expect(result.current.passwordSuccess).toBeNull();
    });
  });

  describe('handleLogout', () => {
    it('appelle logout', async () => {
      mockGetMe.mockResolvedValue(USER);
      const { useAccountScreen } = await import('./useAccountScreen');
      const { result } = renderHook(() => useAccountScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.handleLogout());
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
