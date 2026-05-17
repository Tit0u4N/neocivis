import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

type Env = Readonly<{
  baseUrl: string;
  realm: string;
  username: string;
  password: string;
  webhookUrl: string;
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

async function main(): Promise<void> {
  loadEnv();

  const env: Env = {
    baseUrl: normalizeBaseUrl(requireEnv('KEYCLOAK_BASE_URL')),
    realm: requireEnv('KEYCLOAK_REALM'),
    username: requireEnv('KEYCLOAK_ADMIN_USERNAME'),
    password: requireEnv('KEYCLOAK_ADMIN_PASSWORD'),
    webhookUrl: requireEnv('KEYCLOAK_WEBHOOK_URL'),
  };

  console.log('==========================================');
  console.log('Configuration du Webhook Keycloak');
  console.log('==========================================\n');

  console.log('[1/2] Demande du token d’administration...');
  const token = await fetchAccessToken(env);
  console.log('- Token récupéré avec succès !\n');

  // Debug: list existing webhooks (equivalent to temp_webhooks.json in the .bat)
  const listUrl = `${env.baseUrl}realms/${encodeURIComponent(env.realm)}/webhooks`;
  const listHeaders = new Headers();
  listHeaders.set('Authorization', `Bearer ${token}`);
  listHeaders.set('Content-Type', 'application/json');

  const listRes = await fetch(listUrl, {
    method: 'GET',
    headers: listHeaders,
  });
  if (listRes.ok) {
    const existing = await listRes.text();
    console.log('[DEBUG] Webhooks existants:');
    console.log(existing);
    console.log('');
  } else {
    console.log(`[DEBUG] Impossible de lister les webhooks (HTTP ${listRes.status}).\n`);
  }

  console.log(`[2/2] Création du webhook sur le realm "${env.realm}"...`);
  const createUrl = `${env.baseUrl}realms/${encodeURIComponent(env.realm)}/webhooks`;

  const payload = {
    url: env.webhookUrl,
    enabled: true,
    eventTypes: ['access.REGISTER', 'access.UPDATE', 'access.DELETE'],
  };

  const createHeaders = new Headers();
  createHeaders.set('Authorization', `Bearer ${token}`);
  createHeaders.set('Content-Type', 'application/json');

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: createHeaders,
    body: JSON.stringify(payload),
  });

  const responseText = await createRes.text();

  if (createRes.status === 201) {
    console.log('- [SUCCÈS] Webhook créé avec succès (Code 201)');
  } else {
    console.log(`- [ERREUR] Échec de la création. Code HTTP : ${createRes.status}`);
    if (responseText.trim() !== '') {
      console.log(responseText);
    }
  }
}

await main();
