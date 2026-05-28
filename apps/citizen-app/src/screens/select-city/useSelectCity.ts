import type { CityPublicDto } from '@repo/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useCityStore } from '@/stores/city.store';
import { useProfile } from '@/stores/profile.store';

type SelectCityViewModel = {
  cities: CityPublicDto[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
  onSelect: (city: CityPublicDto) => Promise<void>;
  joiningId: string | null;
};

export function useSelectCity(): SelectCityViewModel {
  const { cityService } = useServices();
  const { setCityId } = useCityStore();
  const { refresh } = useProfile();
  const router = useRouter();

  const [allCities, setAllCities] = useState<CityPublicDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    cityService
      .listCities()
      .then((data) => {
        if (!cancelled) {
          setAllCities(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Impossible de charger les villes');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cityService]);

  const cities = useMemo(() => {
    if (!query.trim()) {
      return allCities;
    }
    const lower = query.toLowerCase();
    return allCities.filter((c) => c.name.toLowerCase().includes(lower));
  }, [allCities, query]);

  const onSelect = async (city: CityPublicDto) => {
    if (joiningId) {
      return;
    }
    setJoiningId(city.id);
    setError(null);
    try {
      await cityService.joinCity(city.id);
      setCityId(city.id);
      void refresh();
      router.replace('/(tabs)/(city)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de rejoindre cette ville');
      setJoiningId(null);
    }
  };

  return { cities, loading, error, query, setQuery, onSelect, joiningId };
}
