import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KeycloakIAMService } from './keycloak-iam.service';

describe('KeycloakIAMService — env not configured', () => {
  it('getUserProfileById returns null', async () => {
    const service = new KeycloakIAMService();
    await expect(service.getUserProfileById('kc-1')).resolves.toBeNull();
  });

  it('getUserByUsername returns null', async () => {
    const service = new KeycloakIAMService();
    await expect(service.getUserByUsername('user1')).resolves.toBeNull();
  });

  it('isUserAbsentFromKeycloak returns true', async () => {
    const service = new KeycloakIAMService();
    await expect(service.isUserAbsentFromKeycloak('kc-1')).resolves.toBe(true);
  });

  it('assignRealmRoles is a no-op when env is absent', async () => {
    const service = new KeycloakIAMService();
    await expect(service.assignRealmRoles('kc-1', ['CITIZEN'])).resolves.toBeUndefined();
  });

  it('createUser throws when env is absent', async () => {
    const service = new KeycloakIAMService();
    await expect(
      service.createUser({ username: 'u', email: 'u@x.com', firstName: 'F', lastName: 'L', realmRoles: [] }),
    ).rejects.toThrow('Keycloak is not configured');
  });

  it('deleteUser throws when env is absent', async () => {
    const service = new KeycloakIAMService();
    await expect(service.deleteUser('kc-1')).rejects.toThrow('Keycloak is not configured');
  });

  it('updateUserProfile throws when env is absent', async () => {
    const service = new KeycloakIAMService();
    await expect(service.updateUserProfile('kc-1', { username: 'new' })).rejects.toThrow('Keycloak is not configured');
  });

  it('sendPasswordResetEmail throws when env is absent', async () => {
    const service = new KeycloakIAMService();
    await expect(service.sendPasswordResetEmail('kc-1', 'neocivis-townhall-app')).rejects.toThrow(
      'Keycloak is not configured',
    );
  });
});

describe('KeycloakIAMService — env configured', () => {
  const TOKEN_RESPONSE = { access_token: 'test-token', expires_in: 3600 };

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('KEYCLOAK_BASE_URL', 'http://keycloak.test/');
    vi.stubEnv('KEYCLOAK_REALM', 'test-realm');
    vi.stubEnv('KEYCLOAK_CLIENT_ID', 'test-client');
    vi.stubEnv('KEYCLOAK_CLIENT_SECRET', 'test-secret');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function jsonResponse(data: unknown, status = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as unknown as Response;
  }

  function errorResponse(status: number, body = 'error'): Response {
    return {
      ok: false,
      status,
      statusText: String(status),
      json: async () => ({}),
      text: async () => body,
    } as unknown as Response;
  }

  describe('getUserProfileById', () => {
    it('returns null on 404', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' } as unknown as Response);
      const service = new KeycloakIAMService();
      await expect(service.getUserProfileById('kc-missing')).resolves.toBeNull();
    });

    it('returns the profile on 200', async () => {
      const kcUser = { username: 'john', email: 'john@x.com', firstName: 'John', lastName: 'Doe' };
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse(kcUser));
      const service = new KeycloakIAMService();
      await expect(service.getUserProfileById('kc-1')).resolves.toEqual({
        username: 'john',
        email: 'john@x.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('throws on non-404 error', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(errorResponse(500));
      const service = new KeycloakIAMService();
      await expect(service.getUserProfileById('kc-1')).rejects.toThrow(/Keycloak user fetch failed/);
    });
  });

  describe('getUserByUsername', () => {
    it('returns null for empty search results', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse([]));
      const service = new KeycloakIAMService();
      await expect(service.getUserByUsername('unknown')).resolves.toBeNull();
    });

    it('returns the user when exactly one match is found', async () => {
      const kcUsers = [{ id: 'kc-1', username: 'john', email: 'john@x.com', firstName: 'John', lastName: 'Doe' }];
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse(kcUsers));
      const service = new KeycloakIAMService();
      const user = await service.getUserByUsername('john');
      expect(user?.id).toBe('kc-1');
      expect(user?.username).toBe('john');
      expect(user?.email).toBe('john@x.com');
    });

    it('throws when multiple users match the username', async () => {
      const kcUsers = [
        { id: 'kc-1', username: 'john' },
        { id: 'kc-2', username: 'john' },
      ];
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse(kcUsers));
      const service = new KeycloakIAMService();
      await expect(service.getUserByUsername('john')).rejects.toThrow(/not unique/);
    });
  });

  describe('isUserAbsentFromKeycloak', () => {
    it('returns true on 404 (by id)', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' } as unknown as Response);
      const service = new KeycloakIAMService();
      await expect(service.isUserAbsentFromKeycloak('kc-missing')).resolves.toBe(true);
    });

    it('returns false on 200 (by id)', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce({ ok: true, status: 200 } as unknown as Response);
      const service = new KeycloakIAMService();
      await expect(service.isUserAbsentFromKeycloak('kc-existing')).resolves.toBe(false);
    });

    it('returns true when username search returns no results', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse([]));
      const service = new KeycloakIAMService();
      await expect(service.isUserAbsentFromKeycloak('kc-1', 'john')).resolves.toBe(true);
    });

    it('returns false when username search finds the same user id', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse([{ id: 'kc-1', username: 'john' }]));
      const service = new KeycloakIAMService();
      await expect(service.isUserAbsentFromKeycloak('kc-1', 'john')).resolves.toBe(false);
    });

    it('returns true when username search finds a different user id', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse([{ id: 'kc-other', username: 'john' }]));
      const service = new KeycloakIAMService();
      await expect(service.isUserAbsentFromKeycloak('kc-1', 'john')).resolves.toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('is a no-op on 404', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' } as unknown as Response);
      const service = new KeycloakIAMService();
      await expect(service.deleteUser('kc-gone')).resolves.toBeUndefined();
    });

    it('throws on non-404 error', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(errorResponse(500));
      const service = new KeycloakIAMService();
      await expect(service.deleteUser('kc-1')).rejects.toThrow(/Keycloak user delete failed/);
    });
  });

  describe('updateUserProfile', () => {
    it('succeeds on ok response', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(jsonResponse({}, 204));
      const service = new KeycloakIAMService();
      await expect(service.updateUserProfile('kc-1', { username: 'new' })).resolves.toBeUndefined();
    });

    it('throws on non-ok response', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(TOKEN_RESPONSE))
        .mockResolvedValueOnce(errorResponse(400));
      const service = new KeycloakIAMService();
      await expect(service.updateUserProfile('kc-1', { username: 'new' })).rejects.toThrow(
        /Keycloak user update failed/,
      );
    });
  });
});
