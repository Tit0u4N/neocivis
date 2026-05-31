import { vi } from 'vitest';

export interface IMockCityService {
  listCities: ReturnType<typeof vi.fn>;
  joinCity: ReturnType<typeof vi.fn>;
  leaveCity: ReturnType<typeof vi.fn>;
}

export const mockCityService: IMockCityService = {
  listCities: vi.fn(),
  joinCity: vi.fn(),
  leaveCity: vi.fn(),
};
