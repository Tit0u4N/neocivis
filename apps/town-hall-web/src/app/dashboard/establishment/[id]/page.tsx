'use client';

import { use } from 'react';
import { EstablishmentFormPage } from '@/features/establishments/form/EstablishmentFormPage';
import { useEstablishmentFormPage } from '@/features/establishments/form/useEstablishmentFormPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditEstablishmentPage({ params }: Props) {
  const { id } = use(params);
  const vm = useEstablishmentFormPage(id);
  return <EstablishmentFormPage {...vm} />;
}
