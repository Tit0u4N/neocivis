'use client';

import { FlaskConical, RotateCcw } from 'lucide-react';
import { IS_DEMO_MODE } from './demo-mode';

/**
 * Pastille flottante signalant la version de démonstration (données fictives, non persistées).
 * Rendue uniquement en mode démo.
 */
export function DemoBadge() {
  if (!IS_DEMO_MODE) {
    return null;
  }

  return (
    <output
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-border bg-primary py-1.5 pr-1.5 pl-3 text-primary-foreground text-xs shadow-lg"
    >
      <FlaskConical aria-hidden="true" className="size-3.5" />
      <span>
        <span className="font-semibold">Démo</span>
        <span className="opacity-80"> · données fictives</span>
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        title="Réinitialiser les données de démo"
        className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 font-medium transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw aria-hidden="true" className="size-3" />
        Réinitialiser
      </button>
    </output>
  );
}
