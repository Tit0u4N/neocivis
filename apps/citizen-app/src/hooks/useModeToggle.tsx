import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { schemeStore } from '@/theme/schemeStore';

type Mode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-mode';

interface UseModeToggleReturn {
  isDark: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
  currentMode: ColorSchemeName;
  toggleMode: () => void;
}

function applyMode(newMode: Mode) {
  if (Platform.OS === 'web') {
    schemeStore.set(newMode === 'system' ? null : newMode);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (newMode !== 'system') {
        root.classList.add(newMode);
        root.setAttribute('data-theme', newMode);
      } else {
        root.removeAttribute('data-theme');
      }
    }
  } else {
    Appearance.setColorScheme(newMode === 'system' ? null : newMode);
  }
}

export function useModeToggle(): UseModeToggleReturn {
  const [mode, setModeState] = useState<Mode>('system');
  const colorScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
        applyMode(saved);
      }
    });
  }, []);

  const isDark = mode === 'system' ? colorScheme === 'dark' : mode === 'dark';

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    applyMode(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    const next: Mode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
  };

  return {
    isDark,
    mode,
    setMode,
    currentMode: mode === 'system' ? colorScheme : mode,
    toggleMode,
  };
}
