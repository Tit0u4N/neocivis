'use client';

import { ArticleService } from '@repo/frontend-services/article';
import { CityService } from '@repo/frontend-services/city';
import { ConfigService } from '@repo/frontend-services/config';
import { EstablishmentService } from '@repo/frontend-services/establishment';
import { MediaService } from '@repo/frontend-services/media';
import { ReportService } from '@repo/frontend-services/report';
import { ThreadService } from '@repo/frontend-services/thread';
import { UserService } from '@repo/frontend-services/user';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

/**
 * City-scoped business services, instantiated once per resolved city.
 * Only services that require a `cityId` live here; non-scoped services
 * (auth, permission, upload) are created where they are used.
 */
type ServicesContextValue = {
  articleService: ArticleService;
  cityService: CityService;
  configService: ConfigService;
  establishmentService: EstablishmentService;
  mediaService: MediaService;
  reportService: ReportService;
  threadService: ThreadService;
  userService: UserService;
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
      cityService: new CityService(api),
      configService: new ConfigService(api, cityId),
      establishmentService: new EstablishmentService(api, cityId),
      mediaService: new MediaService(api, cityId),
      reportService: new ReportService(api, cityId),
      threadService: new ThreadService(api, cityId),
      userService: new UserService(api),
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
