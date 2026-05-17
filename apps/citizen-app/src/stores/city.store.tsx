import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

type CityStore = {
  cityId: string;
  setCityId: (id: string) => void;
};

const CityContext = createContext<CityStore | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cityId, setCityId] = useState('CITY_TEST_ID');

  return <CityContext.Provider value={{ cityId, setCityId }}>{children}</CityContext.Provider>;
}

export function useCityStore(): CityStore {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error('useCityStore must be used inside CityProvider');
  }
  return ctx;
}
