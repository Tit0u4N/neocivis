import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from './createApiClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createApiClient', () => {
  it('attaches Bearer token when tokenProvider returns a token', async () => {
    const tokenProvider = vi.fn().mockResolvedValue('my-token');
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const api = createApiClient({ baseUrl: 'http://api.test/', tokenProvider });
    await api.get('endpoint').json();

    expect(mockFetch).toHaveBeenCalledOnce();
    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('does not attach Authorization header when tokenProvider returns null', async () => {
    const tokenProvider = vi.fn().mockResolvedValue(null);
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const api = createApiClient({ baseUrl: 'http://api.test/', tokenProvider });
    await api.get('endpoint').json();

    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBeNull();
  });

  it('retries on 401 with fresh token and succeeds', async () => {
    const tokenProvider = vi.fn().mockResolvedValue('fresh-token');
    const onUnauthorized = vi.fn();
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const api = createApiClient({ baseUrl: 'http://api.test/', tokenProvider, onUnauthorized });
    const result = await api.get('endpoint').json();

    // Two fetch calls: initial + retry
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // tokenProvider called twice: once in beforeRequest, once in afterResponse
    expect(tokenProvider).toHaveBeenCalledTimes(2);
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('calls onUnauthorized when retry also returns 401', async () => {
    const tokenProvider = vi.fn().mockResolvedValue('stale-token');
    const onUnauthorized = vi.fn();
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
    vi.stubGlobal('fetch', mockFetch);

    const api = createApiClient({ baseUrl: 'http://api.test/', tokenProvider, onUnauthorized });
    await expect(api.get('endpoint').json()).rejects.toThrow();

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('calls onUnauthorized immediately when tokenProvider returns null on 401', async () => {
    const tokenProvider = vi.fn().mockResolvedValue(null);
    const onUnauthorized = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 }));
    vi.stubGlobal('fetch', mockFetch);

    const api = createApiClient({ baseUrl: 'http://api.test/', tokenProvider, onUnauthorized });
    await expect(api.get('endpoint').json()).rejects.toThrow();

    expect(onUnauthorized).toHaveBeenCalledOnce();
    // No retry when tokenProvider returns null
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
