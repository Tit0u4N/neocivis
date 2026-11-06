'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ThreadDetailPage } from '@/features/threads/detail/ThreadDetailPage';
import { useThreadDetailPage } from '@/features/threads/detail/useThreadDetailPage';

/** L'identifiant est passé en query param (`?id=`) pour rester compatible avec l'export statique. */
function ThreadDetailRouteContent() {
  const id = useSearchParams().get('id') ?? '';
  const vm = useThreadDetailPage(id);
  return <ThreadDetailPage {...vm} />;
}

export default function ThreadDetailRoute() {
  return (
    <Suspense>
      <ThreadDetailRouteContent />
    </Suspense>
  );
}
