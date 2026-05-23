import { vi } from 'vitest';

export interface IMockAuthService {
  getMe: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  deleteAccount: ReturnType<typeof vi.fn>;
}

export const mockAuthService: IMockAuthService = {
  getMe: vi.fn(),
  updateUser: vi.fn(),
  deleteAccount: vi.fn(),
};
