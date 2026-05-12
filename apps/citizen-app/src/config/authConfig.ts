import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

/**
 * Keycloak realm base URL — e.g. https://auth.neocivis.cloud/realms/neocivis
 *
 * Multi-tenant note: when one deployment must serve multiple realms dynamically,
 * pass `authority` as a prop to AuthProvider instead of relying on this env var.
 */
export const KEYCLOAK_AUTHORITY = process.env.EXPO_PUBLIC_KEYCLOAK_AUTHORITY ?? '';
export const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'neocivis-citizen-app';

export const authConfig = {
  clientId: KEYCLOAK_CLIENT_ID,
  /**
   * offline_access is required for durable refresh tokens on mobile.
   * Without it, the refresh token may expire with the session.
   */
  scopes: ['openid', 'profile', 'email', Platform.OS !== 'web' ? 'offline_access' : ''],
  redirectUri: makeRedirectUri({
    scheme: 'neocivis-citizen-app',
  }),
};
