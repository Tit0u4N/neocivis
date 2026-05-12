'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  PageLayout: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

import { UserListPage } from './UserListPage';

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(id: number, role: 'ADMIN' | 'EMPLOYEE', firstName: string, lastName: string) {
  return {
    id,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    email: `${firstName.toLowerCase()}@mairie.fr`,
    firstName,
    lastName,
    role,
    lastConnection: null,
  };
}

function makeProps(overrides: Partial<Parameters<typeof UserListPage>[0]> = {}) {
  return {
    users: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    roleFilter: 'all' as const,
    setRoleFilter: vi.fn(),
    confirmDeleteId: null,
    setConfirmDeleteId: vi.fn(),
    handleDelete: vi.fn(),
    editingUser: null,
    editRole: 'EMPLOYEE' as const,
    setEditRole: vi.fn(),
    openEditDialog: vi.fn(),
    closeEditDialog: vi.fn(),
    handleFinishEdit: vi.fn(),
    showCreateDialog: false,
    createForm: { firstName: '', lastName: '', username: '', email: '', role: 'EMPLOYEE' as const },
    createErrors: {},
    openCreateDialog: vi.fn(),
    closeCreateDialog: vi.fn(),
    setCreateField: vi.fn(),
    handleCreate: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UserListPage', () => {
  it('renders skeleton rows while loading', () => {
    const { container } = render(<UserListPage {...makeProps({ isLoading: true })} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no users', () => {
    render(<UserListPage {...makeProps({ isLoading: false, users: [] })} />);
    expect(screen.getByText('Aucun utilisateur trouvé.')).toBeTruthy();
  });

  it('renders a row for each user', () => {
    const users = [makeUser(1, 'ADMIN', 'Alice', 'Martin'), makeUser(2, 'EMPLOYEE', 'Bob', 'Dupont')];
    render(<UserListPage {...makeProps({ users })} />);
    expect(screen.getByText('Alice Martin')).toBeTruthy();
    expect(screen.getByText('Bob Dupont')).toBeTruthy();
  });

  it('shows the error banner when error is set', () => {
    render(<UserListPage {...makeProps({ error: 'Erreur réseau' })} />);
    expect(screen.getByText('Erreur réseau')).toBeTruthy();
  });

  it('calls setSearchQuery when the search input changes', () => {
    const setSearchQuery = vi.fn();
    render(<UserListPage {...makeProps({ setSearchQuery })} />);
    const input = screen.getByPlaceholderText('Rechercher un utilisateur...');
    fireEvent.change(input, { target: { value: 'alice' } });
    expect(setSearchQuery).toHaveBeenCalledWith('alice');
  });

  it('shows the delete confirmation dialog when confirmDeleteId is set', () => {
    render(<UserListPage {...makeProps({ confirmDeleteId: 1 })} />);
    expect(screen.getByText('Supprimer cet utilisateur ?')).toBeTruthy();
  });

  it('calls handleDelete when the delete confirmation is confirmed', () => {
    const handleDelete = vi.fn();
    render(<UserListPage {...makeProps({ confirmDeleteId: 1, handleDelete })} />);
    fireEvent.click(screen.getByText('Supprimer'));
    expect(handleDelete).toHaveBeenCalledWith(1);
  });

  it('calls setConfirmDeleteId(null) when the dialog is cancelled', () => {
    const setConfirmDeleteId = vi.fn();
    render(<UserListPage {...makeProps({ confirmDeleteId: 1, setConfirmDeleteId })} />);
    fireEvent.click(screen.getByText('common.cancel'));
    expect(setConfirmDeleteId).toHaveBeenCalledWith(null);
  });
});
