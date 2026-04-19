import { useEffect, useState } from 'react';
import { useColorScheme as useRnColorScheme } from 'react-native';
import { schemeStore } from '@/theme/schemeStore';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [override, setOverride] = useState(schemeStore.get());
  const colorScheme = useRnColorScheme();

  useEffect(() => {
    setHasHydrated(true);
    return schemeStore.subscribe(setOverride);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }
  if (override !== null) {
    return override;
  }
  return colorScheme;
}
