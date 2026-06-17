'use client';

import { AuthService } from '@repo/frontend-services/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

export type CityGateState = {
  /** True once a managed city is resolved and the protected content can render. */
  isReady: boolean;
};

/**
 * Resolves the staff user's managed city from `/user/me` and stores it.
 * Redirects to the `/no-city` page when the account has no city or the lookup fails,
 * so the dashboard is never rendered without a city scope.
 */
export function useCityGate(): CityGateState {
  const router = useRouter();
  const api = useApi();
  const setCity = useCityStore((s) => s.setCity);
  const cityId = useCityStore((s) => s.cityId);
  const initializedRef = useRef(false);
  const [isReady, setIsReady] = useState(cityId !== null);

  useEffect(() => {
    if (cityId !== null) {
      setIsReady(true);
      return;
    }
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const authService = new AuthService(api);
    authService
      .getMe()
      .then((me) => {
        const id = me.city?.id;
        if (!id) {
          router.replace('/no-city');
          return;
        }
        setCity(id, me.city?.name ?? '');
        setIsReady(true);
      })
      .catch(() => {
        router.replace('/no-city');
      });
  }, [api, cityId, router, setCity]);

  return { isReady };
}
