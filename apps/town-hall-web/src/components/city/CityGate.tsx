'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityGate } from './useCityGate';

type CityGateProps = {
  children: ReactNode;
};

/**
 * Gates the dashboard behind a resolved managed city.
 * Renders a loading state while the city is being resolved; the ViewModel
 * redirects to `/no-city` when no city can be determined.
 */
export function CityGate({ children }: Readonly<CityGateProps>) {
  const { t } = useTranslation();
  const { isReady } = useCityGate();

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
