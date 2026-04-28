import { vi } from 'vitest';

export interface IMockAuthService {
  getCurrentUser: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  deleteAccount: ReturnType<typeof vi.fn>;
}

export const mockAuthService: IMockAuthService = {
  getCurrentUser: vi.fn(),
  updateUser: vi.fn(),
  deleteAccount: vi.fn(),
};
