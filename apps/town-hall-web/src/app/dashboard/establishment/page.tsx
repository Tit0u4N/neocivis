'use client';

import { EstablishmentListPage } from '@/components/establishments/list/EstablishmentListPage';
import { useEstablishmentListPage } from '@/components/establishments/list/useEstablishmentListPage';

export default function EstablishmentsPage() {
  const vm = useEstablishmentListPage();
  return <EstablishmentListPage {...vm} />;
}
