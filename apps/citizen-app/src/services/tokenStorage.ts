/** biome-ignore-all lint/suspicious/useAwait: AUTH */
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  ID_TOKEN: 'auth.id_token',
  EXPIRES_AT: 'auth.expires_at',
} as const;

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  idToken: string | null,
  expiresAt: number,
): Promise<void> {
  const writes = [
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
    SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    SecureStore.setItemAsync(KEYS.EXPIRES_AT, String(expiresAt)),
  ];
  if (idToken !== null) {
    writes.push(SecureStore.setItemAsync(KEYS.ID_TOKEN, idToken));
  }
  await Promise.all(writes);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(KEYS.ID_TOKEN),
    SecureStore.deleteItemAsync(KEYS.EXPIRES_AT),
  ]);
}

/**
 * Returns true if no token is stored or if the stored token has passed its expiry time.
 * Uses a 30-second buffer to account for clock skew and network latency.
 */
export async function isTokenExpired(): Promise<boolean> {
  const expiresAt = await SecureStore.getItemAsync(KEYS.EXPIRES_AT);
  if (expiresAt === null) {
    return true;
  }
  return Date.now() >= Number(expiresAt) - 30_000;
}
