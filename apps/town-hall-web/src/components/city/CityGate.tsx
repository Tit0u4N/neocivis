'use client';

import { AuthService } from '@repo/frontend-services/auth';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

type CityGateProps = {
  children: ReactNode;
};

export function CityGate({ children }: CityGateProps) {
  const { t } = useTranslation();
  const api = useApi();
  const setCity = useCityStore((s) => s.setCity);
  const cityId = useCityStore((s) => s.cityId);
  const [isLoading, setIsLoading] = useState(cityId === null);
  const [hasError, setHasError] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const authService = new AuthService(api);
    void authService
      .getMe()
      .then((me) => {
        const id = me.city?.id;
        if (!id) {
          // biome-ignore lint/suspicious/noConsole: TODO handle missing city for staff user
          console.error('[CityGate] /user/me returned no city for staff user');
          // TODO: handle error — show dedicated UI or redirect
          setHasError(true);
          return;
        }
        setCity(id, me.city?.name ?? '');
      })
      .catch(() => {
        // biome-ignore lint/suspicious/noConsole: TODO handle fetch failure
        console.error('[CityGate] Failed to load /user/me');
        // TODO: handle error
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [api, setCity]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  // TODO: handle error — show dedicated UI or redirect
  if (hasError || cityId === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <p className="text-center text-muted-foreground text-sm">
          Impossible de déterminer la commune gérée. Vérifiez votre compte ou reconnectez-vous.
        </p>
      </div>
    );
  }

  return children;
}
