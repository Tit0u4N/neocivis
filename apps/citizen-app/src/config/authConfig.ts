import { makeRedirectUri } from 'expo-auth-session';

export const discovery = {
  authorizationEndpoint: 'https://auth.neocivis.cloud/realms/neocivis/protocol/openid-connect/auth',
  tokenEndpoint: 'https://auth.neocivis.cloud/realms/neocivis/protocol/openid-connect/token',
};

export const authConfig = {
  clientId: 'neocivis-citizen-app',
  // On ajoute 'offline_access' si on veut s'assurer d'avoir un refresh_token pérenne
  scopes: ['openid', 'profile', 'email', 'offline_access'], 
  redirectUri: makeRedirectUri({
    scheme: 'neocivis-citizen-app',
    path: 'login'
  }),
  usePKCE: true,
};