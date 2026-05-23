import { optionalEnv } from '@/infrastructure/env';
import type { IAMService, IamUser, IamUserProfile } from './iam.service';

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

type KeycloakEnv = Readonly<{
  baseUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  passwordSetupClientId: string;
  passwordSetupRedirectUri: string | undefined;
}>;

function loadKeycloakEnv(): KeycloakEnv | null {
  const baseUrl = optionalEnv('KEYCLOAK_BASE_URL');
  const realm = optionalEnv('KEYCLOAK_REALM');
  const clientId = optionalEnv('KEYCLOAK_CLIENT_ID');
  const clientSecret = optionalEnv('KEYCLOAK_CLIENT_SECRET');

  if (baseUrl === undefined || realm === undefined || clientId === undefined || clientSecret === undefined) {
    return null;
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    realm,
    clientId,
    clientSecret,
    passwordSetupClientId: optionalEnv('KEYCLOAK_PASSWORD_SETUP_CLIENT_ID') ?? 'neocivis-townhall-app',
    passwordSetupRedirectUri: optionalEnv('KEYCLOAK_PASSWORD_SETUP_REDIRECT_URI'),
  };
}

type TokenCache = {
  token: string;
  expiresAtMs: number;
};

async function fetchAdminAccessToken(env: KeycloakEnv): Promise<TokenCache> {
  const url = `${env.baseUrl}realms/${env.realm}/protocol/openid-connect/token`;

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
  const token = typeof json.access_token === 'string' ? json.access_token : '';
  const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 0;
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
    const username = typeof json.username === 'string' ? json.username : undefined;
    const email = typeof json.email === 'string' ? json.email : undefined;
    const firstName = typeof json.firstName === 'string' ? json.firstName : undefined;
    const lastName = typeof json.lastName === 'string' ? json.lastName : undefined;

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
    const id = typeof record.id === 'string' ? record.id : '';
    if (!id) {
      throw new Error('Keycloak user search response missing id');
    }

    const resolvedUsername = typeof record.username === 'string' ? record.username : undefined;
    const email = typeof record.email === 'string' ? record.email : undefined;
    const firstName = typeof record.firstName === 'string' ? record.firstName : undefined;
    const lastName = typeof record.lastName === 'string' ? record.lastName : undefined;

    return { id, username: resolvedUsername, email, firstName, lastName };
  }

  private async getRealmRoleRepresentation(
    env: KeycloakEnv,
    token: string,
    roleName: string,
  ): Promise<Record<string, unknown>> {
    const url = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/roles/${encodeURIComponent(roleName)}`;
    const res = await fetch(url, {
      method: 'GET',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Keycloak role fetch failed: HTTP ${res.status} ${res.statusText}\n${text}`);
    }
    const json = (await res.json()) as Record<string, unknown>;
    return json as Record<string, unknown>;
  }

  private async sendPasswordSetupEmail(env: KeycloakEnv, token: string, userId: string): Promise<void> {
    const url = new URL(
      `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users/${encodeURIComponent(userId)}/execute-actions-email`,
    );
    url.searchParams.set('client_id', env.passwordSetupClientId);
    if (env.passwordSetupRedirectUri) {
      url.searchParams.set('redirect_uri', env.passwordSetupRedirectUri);
    }

    const res = await fetch(url, {
      method: 'PUT',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['UPDATE_PASSWORD']),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Keycloak password setup email failed: HTTP ${res.status} ${res.statusText}\n${text}`);
    }
  }

  async createUser(input: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    realmRoles: string[];
  }): Promise<IamUser> {
    const env = this.getEnv();
    if (!env) {
      throw new Error('Keycloak is not configured');
    }

    const token = await this.getAdminToken(env);
    const url = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users`;

    const payload = {
      username: input.username,
      enabled: true,
      emailVerified: false,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      requiredActions: ['UPDATE_PASSWORD'],
    };

    const res = await fetch(url, {
      method: 'POST',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Keycloak user create failed: HTTP ${res.status} ${res.statusText}\n${text}`);
    }

    const created = await this.getUserByUsername(input.username);
    if (!created) {
      throw new Error('Keycloak user create succeeded but user not found afterwards');
    }

    // Assign realm roles
    if (input.realmRoles.length > 0) {
      const roleReps = await Promise.all(
        input.realmRoles.map(async (r) => await this.getRealmRoleRepresentation(env, token, r)),
      );
      const roleUrl = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users/${encodeURIComponent(
        created.id,
      )}/role-mappings/realm`;
      const roleRes = await fetch(roleUrl, {
        method: 'POST',
        // biome-ignore lint/style/useNamingConvention: HTTP header name
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(roleReps),
      });
      if (!roleRes.ok) {
        const text = await roleRes.text();
        throw new Error(`Keycloak role assign failed: HTTP ${roleRes.status} ${roleRes.statusText}\n${text}`);
      }
    }

    await this.sendPasswordSetupEmail(env, token, created.id);

    return created;
  }

  async assignRealmRoles(userId: string, realmRoles: string[]): Promise<void> {
    const env = this.getEnv();
    if (!env || realmRoles.length === 0) {
      return;
    }

    const token = await this.getAdminToken(env);
    const roleReps = await Promise.all(
      realmRoles.map(async (r) => await this.getRealmRoleRepresentation(env, token, r)),
    );
    const roleUrl = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users/${encodeURIComponent(
      userId,
    )}/role-mappings/realm`;
    const roleRes = await fetch(roleUrl, {
      method: 'POST',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(roleReps),
    });
    if (!roleRes.ok) {
      const text = await roleRes.text();
      throw new Error(`Keycloak role assign failed: HTTP ${roleRes.status} ${roleRes.statusText}\n${text}`);
    }
  }

  async isUserAbsentFromKeycloak(userId: string, username?: string): Promise<boolean> {
    const env = this.getEnv();
    if (!env) {
      return true;
    }

    const token = await this.getAdminToken(env);

    if (username) {
      const searchUrl = new URL(`${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users`);
      searchUrl.searchParams.set('username', username);
      searchUrl.searchParams.set('exact', 'true');
      searchUrl.searchParams.set('max', '2');

      const searchRes = await fetch(searchUrl, {
        method: 'GET',
        // biome-ignore lint/style/useNamingConvention: HTTP header name
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!searchRes.ok) {
        return false;
      }

      const json = (await searchRes.json()) as unknown;
      if (!Array.isArray(json) || json.length === 0) {
        return true;
      }

      return !json.some((entry) => {
        if (typeof entry !== 'object' || entry === null) {
          return false;
        }
        const record = entry as Record<string, unknown>;
        return record.id === userId;
      });
    }

    const url = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users/${encodeURIComponent(userId)}`;
    const res = await fetch(url, {
      method: 'GET',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status === 404;
  }

  async deleteUser(userId: string): Promise<void> {
    const env = this.getEnv();
    if (!env) {
      throw new Error('Keycloak is not configured');
    }
    const token = await this.getAdminToken(env);
    const url = `${env.baseUrl}admin/realms/${encodeURIComponent(env.realm)}/users/${encodeURIComponent(userId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      // biome-ignore lint/style/useNamingConvention: HTTP header name
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) {
      return;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Keycloak user delete failed: HTTP ${res.status} ${res.statusText}\n${text}`);
    }
  }
}
