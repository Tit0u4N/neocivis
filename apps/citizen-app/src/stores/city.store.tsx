import type { CityPublicDto } from '@repo/contracts';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

type CityStore = {
  cityId: string;
  city: CityPublicDto | null;
  setCityId: (id: string) => void;
  setCity: (city: CityPublicDto | null) => void;
};

const CityContext = createContext<CityStore | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cityId, setCityId] = useState('');
  const [city, setCity] = useState<CityPublicDto | null>(null);

  return <CityContext.Provider value={{ cityId, city, setCityId, setCity }}>{children}</CityContext.Provider>;
}

export function useCityStore(): CityStore {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error('useCityStore must be used inside CityProvider');
  }
  return ctx;
}
