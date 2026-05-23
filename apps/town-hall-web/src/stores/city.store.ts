import { create } from 'zustand';

type CityStore = {
  cityId: string | null;
  cityName: string | null;
  setCity: (cityId: string, cityName: string) => void;
  clearCity: () => void;
};

export const useCityStore = create<CityStore>()((set) => ({
  cityId: null,
  cityName: null,
  setCity: (cityId, cityName) => set({ cityId, cityName }),
  clearCity: () => set({ cityId: null, cityName: null }),
}));
