import { vi } from 'vitest';

export interface IMockConfigService {
  getConfig: ReturnType<typeof vi.fn>;
}

export const mockConfigService: IMockConfigService = {
  getConfig: vi.fn(),
};
