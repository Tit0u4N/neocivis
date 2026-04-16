/** biome-ignore-all lint/suspicious/useAwait: AUTH */
/** biome-ignore-all lint/style/useNamingConvention: VAR */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  ID_TOKEN: 'auth.id_token',
  EXPIRES_AT: 'auth.expires_at',
} as const;

// expo-secure-store is not supported on web — fall back to localStorage there.
// localStorage is NOT secure, but adequate for dev; for prod web, swap to a cookie-based flow.
const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  idToken: string | null,
  expiresAt: number,
): Promise<void> {
  const writes = [
    setItem(KEYS.ACCESS_TOKEN, accessToken),
    setItem(KEYS.REFRESH_TOKEN, refreshToken),
    setItem(KEYS.EXPIRES_AT, String(expiresAt)),
  ];
  if (idToken !== null) {
    writes.push(setItem(KEYS.ID_TOKEN, idToken));
  }
  await Promise.all(writes);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    deleteItem(KEYS.ACCESS_TOKEN),
    deleteItem(KEYS.REFRESH_TOKEN),
    deleteItem(KEYS.ID_TOKEN),
    deleteItem(KEYS.EXPIRES_AT),
  ]);
}

/**
 * Returns true if no token is stored or if the stored token has passed its expiry time.
 * Uses a 30-second buffer to account for clock skew and network latency.
 */
export async function isTokenExpired(): Promise<boolean> {
  const expiresAt = await getItem(KEYS.EXPIRES_AT);
  if (expiresAt === null) {
    return true;
  }
  return Date.now() >= Number(expiresAt) - 30_000;
}
