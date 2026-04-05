'use client';

import type { ReactNode } from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';

/**
 * OIDC authority URL, e.g. https://auth.neocivis.cloud/realms/neocivis
 * Multi-tenant note: when one instance must serve multiple realms dynamically,
 * pass `authority` as a prop instead of reading it from a static env var.
 */
const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_KEYCLOAK_AUTHORITY ?? '',
  client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? '',
  redirect_uri: process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI ?? '',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  // PKCE is enabled by default in oidc-client-ts (response_type: 'code')
};

export function AuthProvider({ children }: { children: ReactNode }) {
  return <OidcAuthProvider {...oidcConfig}>{children}</OidcAuthProvider>;
}
