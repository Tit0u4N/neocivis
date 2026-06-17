import { vi } from 'vitest';

export interface IMockCityService {
  listCities: ReturnType<typeof vi.fn>;
  joinCity: ReturnType<typeof vi.fn>;
  leaveCity: ReturnType<typeof vi.fn>;
  updateCity: ReturnType<typeof vi.fn>;
  listCitizens: ReturnType<typeof vi.fn>;
  listEmployees: ReturnType<typeof vi.fn>;
  createAndAssignEmployee: ReturnType<typeof vi.fn>;
  unassignEmployee: ReturnType<typeof vi.fn>;
}

export const mockCityService: IMockCityService = {
  listCities: vi.fn(),
  joinCity: vi.fn(),
  leaveCity: vi.fn(),
  updateCity: vi.fn(),
  listCitizens: vi.fn(),
  listEmployees: vi.fn(),
  createAndAssignEmployee: vi.fn(),
  unassignEmployee: vi.fn(),
};
