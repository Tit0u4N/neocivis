'use client';

import { EstablishmentListPage } from '@/features/establishments/list/EstablishmentListPage';
import { useEstablishmentListPage } from '@/features/establishments/list/useEstablishmentListPage';

export default function EstablishmentsPage() {
  const vm = useEstablishmentListPage();
  return <EstablishmentListPage {...vm} />;
}
