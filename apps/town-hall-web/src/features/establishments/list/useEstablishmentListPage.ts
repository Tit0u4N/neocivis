'use client';

import type { Establishment, EstablishmentType } from '@repo/contracts/establishment';
import { useServices } from 'apps/town-hall-web/src/providers/ServicesProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type ViewMode = 'list' | 'grid';

type TypeFilter = EstablishmentType | 'all';

export function useEstablishmentListPage() {
  const router = useRouter();
  const { establishmentService } = useServices();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await establishmentService.getAll();
      setEstablishments(data);
    } catch {
      setError('Impossible de charger les établissements.');
    } finally {
      setIsLoading(false);
    }
  }, [establishmentService.getAll]);

  useEffect(() => {
    void fetchEstablishments();
  }, [fetchEstablishments]);

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((establishment) => {
      const matchesType = typeFilter === 'all' || establishment.type === typeFilter;
      const matchesSearch = establishment.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [establishments, typeFilter, searchQuery]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await establishmentService.delete(id);
        await fetchEstablishments();
      } catch {
        setError('Impossible de supprimer cet établissement.');
      } finally {
        setDeletingId(null);
        setConfirmDeleteId(null);
      }
    },
    [fetchEstablishments, establishmentService.delete],
  );

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
    isLoading,
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
