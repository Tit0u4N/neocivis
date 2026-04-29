import { vi } from 'vitest';

export interface IMockUploadService {
  uploadImage: ReturnType<typeof vi.fn>;
}

export const mockUploadService: IMockUploadService = {
  uploadImage: vi.fn(),
};
