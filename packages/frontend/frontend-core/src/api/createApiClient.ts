import ky from 'ky';
import type { KyInstance, NormalizedOptions } from 'ky';

export type TokenProvider = () => Promise<string | null>;

export type ApiClientOptions = {
  baseUrl: string;
  tokenProvider: TokenProvider;
  onUnauthorized?: () => void;
};

/**
 * Factory that produces a ky instance pre-configured with auth injection and 401 handling.
 *
 * Token lifecycle (refresh, storage) is fully delegated to the injected tokenProvider —
 * this factory never manages tokens directly.
 *
 * On 401:
 *   1. Calls tokenProvider() again (may return a refreshed token).
 *   2. Retries the request once with the new token.
 *   3. If the retry also returns 401, calls onUnauthorized() and lets ky throw HTTPError.
 *
 * Note: retry re-issues the request without a body — safe for 401 auth checks since
 * servers validate the Authorization header before reading the body.
 */
export function createApiClient({ baseUrl, tokenProvider, onUnauthorized }: ApiClientOptions): KyInstance {
  return ky.create({
    prefixUrl: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await tokenProvider();
          if (token !== null) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        },
      ],
      afterResponse: [
        async (request: Request, _options: NormalizedOptions, response: Response) => {
          if (response.status !== 401) {
            return;
          }

          // Attempt one retry with a potentially refreshed token.
          // ky does not re-run afterResponse for a Response returned from a hook,
          // so this executes at most once per request.
          const freshToken = await tokenProvider();
          if (freshToken === null) {
            onUnauthorized?.();
            return;
          }

          const retryHeaders = new Headers(request.headers);
          retryHeaders.set('Authorization', `Bearer ${freshToken}`);

          const retryResponse = await fetch(request.url, {
            method: request.method,
            headers: retryHeaders,
          });

          if (retryResponse.status === 401) {
            onUnauthorized?.();
          }

          return retryResponse;
        },
      ],
    },
  });
}
