import { vi } from 'vitest';

export const mockAuthService = {
  getCurrentUser: vi.fn(),
  updateUser: vi.fn(),
  deleteAccount: vi.fn(),
};
