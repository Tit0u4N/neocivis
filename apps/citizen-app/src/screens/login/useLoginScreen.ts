import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

const CITIES = ['Marseille', 'Paris', 'Lyon', 'Nice', 'Bordeaux'] as const;
const ROTATION_MS = 3000;

type LoginScreenViewModel = {
  isLoading: boolean;
  onSignIn: () => Promise<void>;
  cities: readonly string[];
  cityIndex: number;
};

export function useLoginScreen(): LoginScreenViewModel {
  const { login, isLoading } = useAuth();
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCityIndex((i) => (i + 1) % CITIES.length), ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  return {
    isLoading,
    onSignIn: login,
    cities: CITIES,
    cityIndex,
  };
}
