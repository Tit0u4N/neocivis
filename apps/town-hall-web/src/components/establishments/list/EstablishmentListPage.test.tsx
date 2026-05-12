'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { EstablishmentListPage } from './EstablishmentListPage';
import type { Establishment } from './useEstablishmentListPage';

afterEach(cleanup);

function makeEstablishment(overrides: Partial<Establishment> = {}): Establishment {
  return {
    id: 'est-1',
    name: 'Mairie principale',
    type: 'mairie',
    address: '1 Place du Général de Gaulle',
    hours: 'Lun-Ven 8h-17h',
    phone: '04 93 32 80 00',
    ...overrides,
  };
}

function makeProps(overrides: Partial<Parameters<typeof EstablishmentListPage>[0]> = {}) {
  return {
    establishments: [],
    typeFilter: 'all' as const,
    setTypeFilter: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    viewMode: 'list' as const,
    setViewMode: vi.fn(),
    confirmDeleteId: null,
    setConfirmDeleteId: vi.fn(),
    deletingId: null,
    error: null,
    handleDelete: vi.fn(),
    navigateToCreate: vi.fn(),
    navigateToEdit: vi.fn(),
    ...overrides,
  };
}

describe('EstablishmentListPage', () => {
  it('shows the empty state when there are no establishments', () => {
    render(<EstablishmentListPage {...makeProps({ establishments: [] })} />);
    expect(screen.getByText('Aucun établissement')).toBeTruthy();
  });

  it('renders a card for each establishment', () => {
    const establishments = [
      makeEstablishment({ id: 'est-1', name: 'Mairie principale' }),
      makeEstablishment({ id: 'est-2', name: 'Médiathèque', type: 'culture' }),
    ];
    render(<EstablishmentListPage {...makeProps({ establishments })} />);
    expect(screen.getByText('Mairie principale')).toBeTruthy();
    expect(screen.getByText('Médiathèque')).toBeTruthy();
  });

  it('shows the count in singular when only one establishment', () => {
    const establishments = [makeEstablishment()];
    render(<EstablishmentListPage {...makeProps({ establishments })} />);
    expect(screen.getByText('1 établissement')).toBeTruthy();
  });

  it('shows the count in plural when multiple establishments', () => {
    const establishments = [makeEstablishment({ id: 'est-1' }), makeEstablishment({ id: 'est-2' })];
    render(<EstablishmentListPage {...makeProps({ establishments })} />);
    expect(screen.getByText('2 établissements')).toBeTruthy();
  });

  it('renders the address, hours and phone fields for an establishment', () => {
    const establishments = [makeEstablishment()];
    render(<EstablishmentListPage {...makeProps({ establishments })} />);
    expect(screen.getByText('1 Place du Général de Gaulle')).toBeTruthy();
    expect(screen.getByText('Lun-Ven 8h-17h')).toBeTruthy();
    expect(screen.getByText('04 93 32 80 00')).toBeTruthy();
  });

  it('shows the error banner when error is provided', () => {
    render(<EstablishmentListPage {...makeProps({ error: 'Quelque chose a foiré' })} />);
    expect(screen.getByText('Quelque chose a foiré')).toBeTruthy();
  });

  it('clicking the "Ajouter" button calls navigateToCreate', () => {
    const navigateToCreate = vi.fn();
    render(<EstablishmentListPage {...makeProps({ navigateToCreate })} />);
    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    fireEvent.click(addButton);
    expect(navigateToCreate).toHaveBeenCalled();
  });
});
