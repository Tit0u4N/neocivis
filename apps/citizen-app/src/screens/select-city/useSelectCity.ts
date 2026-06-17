import type { CityPublicDto } from '@repo/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/toast';
import { useServices } from '@/providers/ServicesProvider';
import { useCityStore } from '@/stores/city.store';
import { useProfile } from '@/stores/profile.store';

type SelectCityViewModel = {
  cities: CityPublicDto[];
  loading: boolean;
  query: string;
  setQuery: (q: string) => void;
  onSelect: (city: CityPublicDto) => Promise<void>;
  joiningId: string | null;
};

export function useSelectCity(): SelectCityViewModel {
  const { cityService } = useServices();
  const { setCityId, setCity } = useCityStore();
  const { refresh } = useProfile();
  const router = useRouter();
  const { t } = useTranslation();
  const { error: toastError } = useToast();

  const [allCities, setAllCities] = useState<CityPublicDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: t et toastError sont stables (react-i18next garantit la stabilité de t)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    cityService
      .listCities()
      .then((data) => {
        if (!cancelled) {
          setAllCities(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toastError(
            t('selectCity.errors.loadTitle'),
            err instanceof Error ? err.message : t('selectCity.errors.loadDesc'),
          );
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
    try {
      await cityService.joinCity(city.id);
      setCityId(city.id);
      setCity(city);
      void refresh();
      router.replace('/(tabs)/(city)');
    } catch (err) {
      toastError(
        t('selectCity.errors.joinTitle'),
        err instanceof Error ? err.message : t('selectCity.errors.joinDesc', { name: city.name }),
      );
      setJoiningId(null);
    }
  };

  return { cities, loading, query, setQuery, onSelect, joiningId };
}
