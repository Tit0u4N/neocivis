'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  PageLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  AlertDialogCancel: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="edit-dialog">{children}</div> : null,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockVm = {
  form: { firstName: 'Jean', lastName: 'Dupont', username: 'jean.dupont', email: 'jean@mairie.fr' },
  isLoading: false,
  loadError: null,
  editingField: null as string | null,
  editingValue: '',
  editingError: null as string | null,
  isEditSubmitting: false,
  passwordDialogOpen: false,
  isPasswordSubmitting: false,
  passwordError: null as string | null,
  passwordSuccess: null as string | null,
  openEditField: vi.fn(),
  setEditingValue: vi.fn(),
  confirmEditField: vi.fn(),
  closeEditField: vi.fn(),
  openPasswordDialog: vi.fn(),
  closePasswordDialog: vi.fn(),
  confirmPasswordReset: vi.fn(),
  handleLogout: vi.fn(),
};

vi.mock('./useAccountPage', () => ({
  useAccountPage: vi.fn(),
}));

import { AccountPage } from './AccountPage';
import { useAccountPage } from './useAccountPage';

function setupVm(overrides: Partial<typeof mockVm> = {}) {
  vi.mocked(useAccountPage).mockReturnValue({ ...mockVm, ...overrides } as ReturnType<typeof useAccountPage>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AccountPage', () => {
  describe('état chargement', () => {
    it('affiche des squelettes pendant isLoading', () => {
      setupVm({ isLoading: true });
      const { container } = render(<AccountPage />);
      const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("n'affiche pas les lignes de champs pendant isLoading", () => {
      setupVm({ isLoading: true });
      render(<AccountPage />);
      expect(screen.queryByText('Jean')).toBeNull();
    });
  });

  describe('liste des champs profil', () => {
    it('affiche les 4 valeurs du formulaire', () => {
      setupVm();
      render(<AccountPage />);
      expect(screen.getByText('Jean')).toBeTruthy();
      expect(screen.getByText('Dupont')).toBeTruthy();
      expect(screen.getByText('jean.dupont')).toBeTruthy();
      expect(screen.getByText('jean@mairie.fr')).toBeTruthy();
    });

    it('le bouton Pencil appelle openEditField avec la bonne clé', () => {
      const openEditField = vi.fn();
      setupVm({ openEditField });
      render(<AccountPage />);
      const editButtons = screen.getAllByRole('button', {
        name: /account\.profile\.editAria/,
      });
      fireEvent.click(editButtons[0]);
      expect(openEditField).toHaveBeenCalledWith('firstName');
    });

    it('affiche le loadError si présent', () => {
      setupVm({ loadError: 'Erreur réseau.' });
      render(<AccountPage />);
      expect(screen.getByText('Erreur réseau.')).toBeTruthy();
    });
  });

  describe('dialog édition champ', () => {
    it("n'affiche pas la dialog quand editingField est null", () => {
      setupVm({ editingField: null });
      render(<AccountPage />);
      expect(screen.queryByTestId('edit-dialog')).toBeNull();
    });

    it('affiche la dialog quand editingField est défini', () => {
      setupVm({ editingField: 'firstName', editingValue: 'Jean' });
      render(<AccountPage />);
      expect(screen.getByTestId('edit-dialog')).toBeTruthy();
    });

    it("appelle setEditingValue à la saisie dans l'input", () => {
      const setEditingValue = vi.fn();
      setupVm({ editingField: 'username', editingValue: 'jean.dupont', setEditingValue });
      render(<AccountPage />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'pierre.martin' } });
      expect(setEditingValue).toHaveBeenCalledWith('pierre.martin');
    });

    it("affiche l'erreur d'édition si présente", () => {
      setupVm({ editingField: 'username', editingValue: 'ab', editingError: 'Trop court.' });
      render(<AccountPage />);
      expect(screen.getByText('Trop court.')).toBeTruthy();
    });

    it('le bouton Enregistrer appelle confirmEditField', () => {
      const confirmEditField = vi.fn();
      setupVm({ editingField: 'firstName', editingValue: 'Pierre', confirmEditField });
      render(<AccountPage />);
      fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
      expect(confirmEditField).toHaveBeenCalled();
    });

    it('le bouton Annuler appelle closeEditField', () => {
      const closeEditField = vi.fn();
      setupVm({ editingField: 'firstName', editingValue: 'Pierre', closeEditField });
      render(<AccountPage />);
      fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
      expect(closeEditField).toHaveBeenCalled();
    });
  });

  describe('section mot de passe', () => {
    it('le bouton changer mot de passe appelle openPasswordDialog', () => {
      const openPasswordDialog = vi.fn();
      setupVm({ openPasswordDialog });
      render(<AccountPage />);
      fireEvent.click(screen.getByRole('button', { name: /account\.password\.button/ }));
      expect(openPasswordDialog).toHaveBeenCalled();
    });

    it("affiche le bandeau d'erreur password", () => {
      setupVm({ passwordError: 'Envoi impossible.' });
      render(<AccountPage />);
      expect(screen.getByText('Envoi impossible.')).toBeTruthy();
    });

    it('affiche le bandeau de succès password', () => {
      setupVm({ passwordSuccess: 'Email envoyé à jean@mairie.fr.' });
      render(<AccountPage />);
      expect(screen.getByText('Email envoyé à jean@mairie.fr.')).toBeTruthy();
    });
  });

  describe('section session', () => {
    it('le bouton se déconnecter appelle handleLogout', () => {
      const handleLogout = vi.fn();
      setupVm({ handleLogout });
      render(<AccountPage />);
      fireEvent.click(screen.getByRole('button', { name: /nav\.logout/ }));
      expect(handleLogout).toHaveBeenCalled();
    });
  });
});
