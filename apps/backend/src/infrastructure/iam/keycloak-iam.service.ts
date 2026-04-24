import { optionalEnv } from '@/infrastructure/env';
import type { IAMService, IamUser, IamUserProfile } from './iam.service';

type KeycloakEnv = Readonly<{
  baseUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}>;

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function loadKeycloakEnv(): KeycloakEnv | null {
  const baseUrl = optionalEnv('KEYCLOAK_BASE_URL');
  const realm = optionalEnv('KEYCLOAK_REALM');
  const clientId = optionalEnv('KEYCLOAK_CLIENT_ID');
  const clientSecret = optionalEnv('KEYCLOAK_CLIENT_SECRET');

  if (
    baseUrl === undefined ||
    realm === undefined ||
    clientId === undefined ||
    clientSecret === undefined
  ) {
    return null;
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    realm,
    clientId,
    clientSecret,
  };
}

type TokenCache = {
  token: string;
  expiresAtMs: number;
};

async function fetchAdminAccessToken(env: KeycloakEnv): Promise<TokenCache> {
  const url = `${env.baseUrl}realms/master/protocol/openid-connect/token`;

  const body = new URLSearchParams();
  body.set('grant_type', 'client_credentials');
  body.set('client_id', env.clientId);
  body.set('client_secret', env.clientSecret);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keycloak token request failed: HTTP ${res.status} ${res.statusText}\n${text}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const token = typeof json['access_token'] === 'string' ? json['access_token'] : '';
  const expiresIn = typeof json['expires_in'] === 'number' ? json['expires_in'] : 0;
  if (!token) {
    throw new Error('Keycloak token response missing access_token');
  }

  // Petite marge pour éviter d'utiliser un token en fin de vie.
  const safetyMs = 10_000;
  const expiresAtMs = Date.now() + Math.max(0, expiresIn * 1000 - safetyMs);
  return { token, expiresAtMs };
}

export class KeycloakIAMService implements IAMService {
  private tokenCache: TokenCache | null = null;
  private env: KeycloakEnv | null = null;

  private getEnv(): KeycloakEnv | null {
    if (this.env === null) {
      this.env = loadKeycloakEnv();
    }
    return this.env;
  }

  private async getAdminToken(env: KeycloakEnv): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAtMs > Date.now()) {
      return this.tokenCache.token;
    }
    this.tokenCache = await fetchAdminAccessToken(env);
    return this.tokenCache.token;
  }

  async getUserProfileById(userId: string): Promise<IamUserProfile | null> {
    const env = this.getEnv();
    if (!env) {
      return null;
    }

    const token = await this.getAdminToken(env);
    const url = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users/${encodeURIComponent(userId)}`;

    const res = await fetch(url, {
      method: 'GET',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Keycloak user fetch failed: HTTP ${res.status} ${res.statusText}\n${text}`);
    }

    const json = (await res.json()) as Record<string, unknown>;
    const username = typeof json['username'] === 'string' ? json['username'] : undefined;
    const email = typeof json['email'] === 'string' ? json['email'] : undefined;
    const firstName = typeof json['firstName'] === 'string' ? json['firstName'] : undefined;
    const lastName = typeof json['lastName'] === 'string' ? json['lastName'] : undefined;

    return { username, email, firstName, lastName };
  }

  async getUserByUsername(username: string): Promise<IamUser | null> {
    const env = this.getEnv();
    if (!env) {
      return null;
    }

    const token = await this.getAdminToken(env);
    const url = new URL(`${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users`);
    url.searchParams.set('username', username);
    url.searchParams.set('exact', 'true');
    url.searchParams.set('max', '2');

    const res = await fetch(url, {
      method: 'GET',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Keycloak user search failed: HTTP ${res.status} ${res.statusText}\n${text}`);
    }

    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || json.length === 0) {
      return null;
    }
    if (json.length > 1) {
      throw new Error(`Keycloak user search not unique for username="${username}"`);
    }

    const record = json[0] as Record<string, unknown>;
    const id = typeof record['id'] === 'string' ? record['id'] : '';
    if (!id) {
      throw new Error('Keycloak user search response missing id');
    }

    const resolvedUsername = typeof record['username'] === 'string' ? record['username'] : undefined;
    const email = typeof record['email'] === 'string' ? record['email'] : undefined;
    const firstName = typeof record['firstName'] === 'string' ? record['firstName'] : undefined;
    const lastName = typeof record['lastName'] === 'string' ? record['lastName'] : undefined;

    return { id, username: resolvedUsername, email, firstName, lastName };
  }
}

