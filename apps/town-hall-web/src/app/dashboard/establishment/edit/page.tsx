'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { EstablishmentFormPage } from '@/features/establishments/form/EstablishmentFormPage';
import { useEstablishmentFormPage } from '@/features/establishments/form/useEstablishmentFormPage';

/** L'identifiant est passé en query param (`?id=`) pour rester compatible avec l'export statique. */
function EditEstablishmentPageContent() {
  const id = useSearchParams().get('id') ?? '';
  const vm = useEstablishmentFormPage(id);
  return <EstablishmentFormPage {...vm} />;
}

export default function EditEstablishmentPage() {
  return (
    <Suspense>
      <EditEstablishmentPageContent />
    </Suspense>
  );
}
