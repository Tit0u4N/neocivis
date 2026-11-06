import { getDemoUser } from '@demo-api';
import { type ReactNode, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { AuthContext, type AuthUser } from '@/providers/AuthProvider';
import { DEMO_USERNAME } from './demo-mode';

/**
 * Remplace l'auth Keycloak en mode démo : « Se connecter » connecte directement
 * l'utilisateur de seed, sans redirection ni token.
 */
export function DemoAuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const demoUser = useMemo<AuthUser>(() => {
    const u = getDemoUser(DEMO_USERNAME);
    return {
      sub: u.keycloakId,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      // biome-ignore lint/style/useNamingConvention: claims OIDC
      given_name: u.firstName,
      // biome-ignore lint/style/useNamingConvention: claims OIDC
      family_name: u.lastName,
    };
  }, []);
  const [user, setUser] = useState<AuthUser | null>(demoUser);

  const login = (): Promise<void> => {
    setUser(demoUser);
    return Promise.resolve();
  };

  const logout = (): Promise<void> => {
    setUser(null);
    // Sur le web, on recharge pour réinitialiser les données de démo.
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isLoading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
