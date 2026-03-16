import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native-reanimated/lib/typescript/ReanimatedModule/js-reanimated/JSReanimated';

export const discovery = {
  authorizationEndpoint: 'https://auth.neocivis.cloud/realms/neocivis/protocol/openid-connect/auth',
  tokenEndpoint: 'https://auth.neocivis.cloud/realms/neocivis/protocol/openid-connect/token',
};

export const authConfig = {
  clientId: 'neocivis-citizen-app',
  // On ajoute 'offline_access' si on veut s'assurer d'avoir un refresh_token pérenne
  // TODO : ajouter 'offline_access' pour mobile (mais pas pour web) et gérer le refresh token en conséquence
  scopes: ['openid', 'profile', 'email'], 
  redirectUri: makeRedirectUri({
    scheme: 'neocivis-citizen-app'
    
  }),
  usePKCE: true,
};