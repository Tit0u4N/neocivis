import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadService } from './upload.service';

function makeKy(): KyInstance {
  const base = {
    extend: vi.fn(),
  };
  (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
  return base as unknown as KyInstance;
}

describe('UploadService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: UploadService;

  beforeEach(() => {
    ky = makeKy();
    service = new UploadService(ky);
  });

  describe('uploadImage', () => {
    it('removes Content-Type header, POSTs FormData to uploads/image, and returns the url', async () => {
      const json = vi.fn().mockResolvedValue({ url: 'https://example.com/uploaded.jpg' });
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await service.uploadImage(file);

      expect(ky.extend).toHaveBeenCalledWith({ headers: { 'Content-Type': undefined } });
      expect(postMock).toHaveBeenCalledWith('uploads/image', expect.objectContaining({ body: expect.any(FormData) }));
      expect(result).toBe('https://example.com/uploaded.jpg');
    });

    it('includes the file in FormData', async () => {
      const json = vi.fn().mockResolvedValue({ url: 'https://example.com/uploaded.jpg' });
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      await service.uploadImage(file);

      const formData: FormData = postMock.mock.calls[0][1].body;
      expect(formData.get('file')).toBe(file);
    });
  });
});
