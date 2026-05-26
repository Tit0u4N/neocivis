'use client';

import { ArticleService } from '@repo/frontend-services/article';
import { ConfigService } from '@repo/frontend-services/config';
import { MediaService } from '@repo/frontend-services/media';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

/**
 * City-scoped business services, instantiated once per resolved city.
 * Only services that require a `cityId` live here; non-scoped services
 * (auth, permission, upload, report) are created where they are used.
 */
type ServicesContextValue = {
  articleService: ArticleService;
  configService: ConfigService;
  mediaService: MediaService;
};

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined);

/**
 * Provides the city-scoped services to the dashboard.
 * Must be mounted under `CityGate`, which guarantees a resolved `cityId`.
 */
export function ServicesProvider({ children }: Readonly<{ children: ReactNode }>) {
  const api = useApi();
  const cityId = useCityStore((s) => s.cityId);

  if (!cityId) {
    throw new Error('ServicesProvider must be mounted under CityGate (cityId is required)');
  }

  const services = useMemo<ServicesContextValue>(
    () => ({
      articleService: new ArticleService(api, cityId),
      configService: new ConfigService(api, cityId),
      mediaService: new MediaService(api, cityId),
    }),
    [api, cityId],
  );

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used inside ServicesProvider');
  }
  return context;
}
