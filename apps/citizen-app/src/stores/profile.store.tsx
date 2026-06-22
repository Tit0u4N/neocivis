import type { UserMeDto } from '@repo/contracts';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useServices } from '@/providers/ServicesProvider';

type ProfileStore = {
  profile: UserMeDto | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileStore | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { authService } = useServices();
  const [profile, setProfile] = useState<UserMeDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const me = await authService.getMe();
      setProfile(me);
    } catch (err) {
      console.log('[Profile] getMe failed:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [isAuthenticated, refresh]);

  return <ProfileContext.Provider value={{ profile, isLoading, error, refresh }}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileStore {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used inside ProfileProvider');
  }
  return ctx;
}
