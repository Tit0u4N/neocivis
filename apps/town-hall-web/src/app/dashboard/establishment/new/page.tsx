'use client';

import { EstablishmentFormPage } from '@/features/establishments/form/EstablishmentFormPage';
import { useEstablishmentFormPage } from '@/features/establishments/form/useEstablishmentFormPage';

export default function NewEstablishmentPage() {
  const vm = useEstablishmentFormPage();
  return <EstablishmentFormPage {...vm} />;
}
