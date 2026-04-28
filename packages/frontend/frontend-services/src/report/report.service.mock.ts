import { vi } from 'vitest';

export const mockReportService = {
  create: vi.fn(),
  getMine: vi.fn(),
  getById: vi.fn(),
  cancel: vi.fn(),
};
