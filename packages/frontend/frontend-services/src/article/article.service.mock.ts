import { vi } from 'vitest';

export const mockArticleService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  getPublished: vi.fn(),
  getByIdResolved: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateStatus: vi.fn(),
  addTranslation: vi.fn(),
  updateTranslation: vi.fn(),
  deleteTranslation: vi.fn(),
};
