import { jwt } from 'hono/jwt';
import type { MiddlewareHandler } from 'hono';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? 'http://localhost:8080';
const REALM = process.env.KEYCLOAK_REALM ?? 'neocivis';

const getPublicKey = async (): Promise<CryptoKey> => {
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`
  );
  const { keys } = await res.json();
  return crypto.subtle.importKey(
    'jwk',
    keys[0],
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    ['verify']
  );
};

let cachedKey: CryptoKey | null = null;

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (!cachedKey) {
    cachedKey = await getPublicKey();
  }

  return jwt({ secret: cachedKey as unknown as string, alg: 'RS256' })(c, next);
};
