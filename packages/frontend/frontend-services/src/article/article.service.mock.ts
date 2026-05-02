import { vi } from 'vitest';

export interface IMockArticleService {
  getAll: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getPublished: ReturnType<typeof vi.fn>;
  getByIdResolved: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
  addTranslation: ReturnType<typeof vi.fn>;
  updateTranslation: ReturnType<typeof vi.fn>;
  deleteTranslation: ReturnType<typeof vi.fn>;
}

export const mockArticleService: IMockArticleService = {
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
