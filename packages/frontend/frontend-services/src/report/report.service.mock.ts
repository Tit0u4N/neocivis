import { vi } from 'vitest';

export interface IMockReportService {
  create: ReturnType<typeof vi.fn>;
  getMine: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
}

export const mockReportService: IMockReportService = {
  create: vi.fn(),
  getMine: vi.fn(),
  getById: vi.fn(),
  cancel: vi.fn(),
};
