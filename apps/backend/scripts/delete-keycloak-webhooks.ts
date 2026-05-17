import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

type Env = Readonly<{
  baseUrl: string;
  realm: string;
  username: string;
  password: string;
}>;

function loadEnv(): void {
  const here = resolve(fileURLToPath(new URL('.', import.meta.url)));

  const candidatePaths = [
    resolve(here, '.env.local'),
    resolve(here, '.env'),
  ];

  for (const path of candidatePaths) {
    if (existsSync(path)) {
      dotenv.config({ path });
      break;
    }
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

async function fetchAccessToken(env: Env): Promise<string> {
  const url = `${env.baseUrl}realms/master/protocol/openid-connect/token`;

  const body = new URLSearchParams();
  body.set('username', env.username);
  body.set('password', env.password);
  body.set('grant_type', 'password');
  body.set('client_id', 'admin-cli');

  const headers = new Headers();
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: HTTP ${res.status} ${res.statusText}\n${text}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const token = typeof json['access_token'] === 'string' ? json['access_token'] : '';
  if (token === '') {
    throw new Error('Token response missing access_token');
  }
  return token;
}

async function fetchWebhookIds(baseUrl: string, realm: string, token: string): Promise<string[]> {
  const url = `${baseUrl}realms/${encodeURIComponent(realm)}/webhooks`;

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List webhooks failed: HTTP ${res.status} ${res.statusText}\n${text}`);
  }

  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) {
    throw new Error('Unexpected webhooks response: expected JSON array');
  }

  const ids: string[] = [];
  for (const item of json) {
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const id = record['id'];
      if (typeof id === 'string' && id.trim() !== '') {
        ids.push(id);
      }
    }
  }

  return ids;
}

async function deleteWebhook(baseUrl: string, realm: string, token: string, id: string): Promise<boolean> {
  const url = `${baseUrl}realms/${encodeURIComponent(realm)}/webhooks/${encodeURIComponent(id)}`;

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { method: 'DELETE', headers });
  if (res.status === 204) {
    return true;
  }

  const text = await res.text();
  console.log(`- [ERREUR] Suppression échouée (id=${id}) HTTP ${res.status}`);
  if (text.trim() !== '') {
    console.log(text);
  }
  return false;
}

async function main(): Promise<void> {
  loadEnv();

  const env: Env = {
    baseUrl: normalizeBaseUrl(requireEnv('KEYCLOAK_BASE_URL')),
    realm: requireEnv('KEYCLOAK_REALM'),
    username: requireEnv('KEYCLOAK_ADMIN_USERNAME'),
    password: requireEnv('KEYCLOAK_ADMIN_PASSWORD'),
  };

  console.log('==========================================');
  console.log('Suppression des Webhooks Keycloak');
  console.log('==========================================\n');

  console.log('[1/3] Demande du token d’administration...');
  const token = await fetchAccessToken(env);
  console.log('- Token récupéré avec succès !\n');

  console.log(`[2/3] Récupération des webhooks du realm "${env.realm}"...`);
  const ids = await fetchWebhookIds(env.baseUrl, env.realm, token);
  console.log(`- ${ids.length} webhook(s) trouvé(s)\n`);

  console.log('[3/3] Suppression...');
  let okCount = 0;
  for (const id of ids) {
    const ok = await deleteWebhook(env.baseUrl, env.realm, token, id);
    if (ok) {
      okCount += 1;
      console.log(`- [OK] Supprimé (id=${id})`);
    }
  }

  console.log('');
  console.log(`Terminé. Supprimés: ${okCount}/${ids.length}`);
}

await main();

