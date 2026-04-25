import { refreshAsync } from 'expo-auth-session';
import { KEYCLOAK_AUTHORITY, authConfig } from '@/config/authConfig';
import { getRefreshToken, saveTokens } from '@/services/tokenStorage';

type OidcDiscovery = {
  token_endpoint: string;
};

async function fetchTokenEndpoint(authority: string): Promise<string> {
  const response = await fetch(`${authority}/.well-known/openid-configuration`);
  const config = (await response.json()) as OidcDiscovery;
  return config.token_endpoint;
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 *
 * Resolves the token endpoint dynamically via the OIDC well-known document
 * so the URL is never hardcoded.
 *
 * @returns The new access token on success, or null if the session has expired.
 */
export async function refreshAccessToken(authority: string = KEYCLOAK_AUTHORITY): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const tokenEndpoint = await fetchTokenEndpoint(authority);
    const tokenResponse = await refreshAsync(
      {
        clientId: authConfig.clientId,
        refreshToken,
      },
      { tokenEndpoint },
    );

    const expiresAt = Date.now() + (tokenResponse.expiresIn ?? 300) * 1000;
    await saveTokens(
      tokenResponse.accessToken,
      tokenResponse.refreshToken ?? refreshToken,
      tokenResponse.idToken ?? null,
      expiresAt,
    );

    return tokenResponse.accessToken;
  } catch {
    return null;
  }
}
