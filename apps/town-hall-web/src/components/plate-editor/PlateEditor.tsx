'use client';

import dynamic from 'next/dynamic';

export const PlateEditor = dynamic(() => import('./PlateEditor.impl').then((m) => m.PlateEditor), {
  ssr: false,
  loading: () => (
    <div className="rounded-md border bg-background p-4 text-muted-foreground text-sm">Chargement de l'éditeur…</div>
  ),
});
