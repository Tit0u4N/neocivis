import type { KyInstance } from 'ky';

// TODO : update withe the real API

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserData = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Handles user profile operations via the authenticated API client.
 * Authentication lifecycle (tokens, OIDC) is not managed here — it is
 * delegated to the KyInstance provided at construction time via createApiClient.
 */
export class AuthService {
  constructor(private readonly api: KyInstance) {}

  async getCurrentUser(): Promise<UserProfile> {
    return this.api.get('profile').json<UserProfile>();
  }

  async updateUser(data: UpdateUserData): Promise<UserProfile> {
    return this.api.patch('profile', { json: data }).json<UserProfile>();
  }

  async deleteAccount(): Promise<void> {
    await this.api.delete('profile');
  }
}
