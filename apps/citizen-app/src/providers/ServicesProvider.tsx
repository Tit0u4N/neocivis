import { ArticleService } from '@repo/frontend-services/article';
import { AuthService } from '@repo/frontend-services/auth';
import { CityService } from '@repo/frontend-services/city';
import { ConfigService } from '@repo/frontend-services/config';
import { ReportService } from '@repo/frontend-services/report';
import { ThreadService } from '@repo/frontend-services/thread';
import { UserService } from '@repo/frontend-services/user';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

type ServicesContextValue = {
  authService: AuthService;
  cityService: CityService;
  articleService: ArticleService;
  configService: ConfigService;
  reportService: ReportService;
  threadService: ThreadService;
  userService: UserService;
};

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined);

export function ServicesProvider({ children }: Readonly<{ children: ReactNode }>) {
  const api = useApi();
  const { cityId } = useCityStore();

  const services = useMemo<ServicesContextValue>(
    () => ({
      authService: new AuthService(api),
      cityService: new CityService(api),
      articleService: new ArticleService(api, cityId),
      configService: new ConfigService(api, cityId),
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
