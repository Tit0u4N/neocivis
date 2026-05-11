'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export type EstablishmentType = 'mairie' | 'education' | 'culture' | 'sport';

export type Establishment = {
  id: string;
  name: string;
  type: EstablishmentType;
  address: string;
  hours: string;
  phone: string;
  imageUrl?: string;
};

export type ViewMode = 'list' | 'grid';

type TypeFilter = EstablishmentType | 'all';

const INITIAL_ESTABLISHMENTS: Establishment[] = [
  {
    id: 'est-1',
    name: 'Mairie principale',
    type: 'mairie',
    address: '1 Place du Général de Gaulle',
    hours: 'Lun-Ven 8h-17h',
    phone: '04 93 32 80 00',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',
  },
  {
    id: 'est-2',
    name: 'École primaire Jules Ferry',
    type: 'education',
    address: '12 Rue des Écoles',
    hours: 'Lun-Ven 8h30-16h30',
    phone: '04 93 32 12 34',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
  },
  {
    id: 'est-3',
    name: 'Médiathèque municipale',
    type: 'culture',
    address: '5 Allée des Oliviers',
    hours: 'Mar-Sam 10h-18h',
    phone: '04 93 32 45 67',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80',
  },
  {
    id: 'est-4',
    name: 'Stade municipal',
    type: 'sport',
    address: 'Route de Vence',
    hours: 'Tous les jours 7h-22h',
    phone: '04 93 32 89 10',
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80',
  },
];

export function useEstablishmentListPage() {
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>(INITIAL_ESTABLISHMENTS);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((establishment) => {
      const matchesType = typeFilter === 'all' || establishment.type === typeFilter;
      const matchesSearch = establishment.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [establishments, typeFilter, searchQuery]);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    try {
      setEstablishments((prev) => prev.filter((establishment) => establishment.id !== id));
    } catch {
      setError('Impossible de supprimer cet établissement.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }, []);

  const navigateToCreate = useCallback(() => {
    router.push('/dashboard/establishment/new');
  }, [router]);

  const navigateToEdit = useCallback(
    (id: string) => {
      router.push(`/dashboard/establishment/${id}`);
    },
    [router],
  );

  return {
    establishments: filteredEstablishments,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    confirmDeleteId,
    setConfirmDeleteId,
    deletingId,
    error,
    handleDelete,
    navigateToCreate,
    navigateToEdit,
  };
}
