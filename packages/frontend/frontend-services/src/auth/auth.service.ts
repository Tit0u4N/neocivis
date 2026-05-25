import type { UserMeDto } from '@repo/contracts';
import type { KyInstance } from 'ky';

export type UpdateUserData = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Handles authenticated user profile operations via the municipality/citizen API.
 * Authentication lifecycle (tokens, OIDC) is delegated to the injected KyInstance.
 */
export class AuthService {
  constructor(private readonly api: KyInstance) {}

  async getMe(): Promise<UserMeDto> {
    return await this.api.get('user/me').json<UserMeDto>();
  }

  // TODO: wire update/delete when backend endpoints exist (OR REDIRECT TO KEYCLOAK UI)
  // biome-ignore lint/suspicious/useAwait: TODO handle update/delete
  async updateUser(_data: UpdateUserData): Promise<UserMeDto> {
    throw new Error('Not implemented');
  }

  // TODO: wire delete when backend endpoints exist (OR REDIRECT TO KEYCLOAK UI)
  // biome-ignore lint/suspicious/useAwait: TODO handle delete
  async deleteAccount(): Promise<void> {
    throw new Error('Not implemented');
  }
}
