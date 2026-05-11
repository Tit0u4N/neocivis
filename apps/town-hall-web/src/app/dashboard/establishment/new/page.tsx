'use client';

import { EstablishmentFormPage } from '@/components/establishments/form/EstablishmentFormPage';
import { useEstablishmentFormPage } from '@/components/establishments/form/useEstablishmentFormPage';

export default function NewEstablishmentPage() {
  const vm = useEstablishmentFormPage();
  return <EstablishmentFormPage {...vm} />;
}
