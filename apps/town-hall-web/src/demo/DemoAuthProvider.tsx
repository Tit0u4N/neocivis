'use client';

import { getDemoUser } from '@demo-api';
import { User } from 'oidc-client-ts';
import { type ReactNode, useMemo } from 'react';
import { AuthContext, type AuthContextProps } from 'react-oidc-context';
import { DEMO_USERNAME } from './demo-mode';

const noop = (): Promise<void> => Promise.resolve();

/**
 * Remplace le provider OIDC en mode démo : l'utilisateur de seed est toujours connecté.
 * Fournit le même `AuthContext` que `react-oidc-context`, donc `useAuth()` fonctionne sans changement.
 */
export function DemoAuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const value = useMemo<AuthContextProps>(() => {
    const demoUser = getDemoUser(DEMO_USERNAME);
    const user = new User({
      access_token: 'demo-token',
      token_type: 'Bearer',
      profile: {
        sub: demoUser.keycloakId,
        iss: 'neocivis-demo',
        aud: 'neocivis-demo',
        exp: Number.MAX_SAFE_INTEGER,
        iat: 0,
        preferred_username: demoUser.username,
        email: demoUser.email,
        given_name: demoUser.firstName,
        family_name: demoUser.lastName,
        name: `${demoUser.firstName} ${demoUser.lastName}`,
      },
    });

    return {
      user,
      isLoading: false,
      isAuthenticated: true,
      activeNavigator: undefined,
      error: undefined,
      settings: {} as AuthContextProps['settings'],
      events: {} as AuthContextProps['events'],
      clearStaleState: noop,
      removeUser: noop,
      signinPopup: () => Promise.resolve(user),
      signinSilent: () => Promise.resolve(user),
      signinRedirect: noop,
      signinResourceOwnerCredentials: () => Promise.resolve(user),
      // En démo, « se déconnecter » recharge simplement l'application (données réinitialisées).
      signoutRedirect: () => {
        window.location.assign(process.env.NEXT_PUBLIC_BASE_PATH || '/');
        return Promise.resolve();
      },
      signoutPopup: noop,
      signoutSilent: noop,
      querySessionStatus: () => Promise.resolve(null),
      revokeTokens: noop,
      startSilentRenew: () => undefined,
      stopSilentRenew: () => undefined,
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
