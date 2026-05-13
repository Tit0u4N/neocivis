import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CityStore = {
  cityId: string;
  setCityId: (cityId: string) => void;
};

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      cityId: 'CITY_TEST_ID',
      setCityId: (cityId) => set({ cityId }),
    }),
    { name: 'neocivis-city' },
  ),
);
