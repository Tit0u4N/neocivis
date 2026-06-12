import type { MediaImage } from '@repo/contracts/media';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaService } from './media.service';

const CITY_ID = 'NIC_06000';

const mockMedia: MediaImage = {
  id: '00000000-0000-0000-0000-000000000002',
  url: 'https://example.com/image.jpg',
  storagePath: 'cities/NIC_06000/image.jpg',
  cityId: CITY_ID as MediaImage['cityId'],
  createdAt: '2026-01-01T00:00:00.000Z',
  links: [],
};

function makeKy(): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
    delete: vi.fn().mockReturnValue({ json }),
    extend: vi.fn(),
  };
  (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
  return base as unknown as KyInstance;
}

describe('MediaService', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: MediaService;

  beforeEach(() => {
    ky = makeKy();
    service = new MediaService(ky, CITY_ID);
  });

  describe('getAll', () => {
    it('calls GET media and returns the image list', async () => {
      const json = vi.fn().mockResolvedValue([mockMedia]);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getAll();

      expect(ky.get).toHaveBeenCalledWith('media');
      expect(result).toEqual([mockMedia]);
    });
  });

  describe('upload', () => {
    it('removes Content-Type header, POSTs FormData to media/upload, and returns the image', async () => {
      const json = vi.fn().mockResolvedValue(mockMedia);
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await service.upload(file);

      expect(ky.extend).toHaveBeenCalledWith({ headers: { 'Content-Type': undefined } });
      expect(postMock).toHaveBeenCalledWith('media/upload', expect.objectContaining({ body: expect.any(FormData) }));
      expect(result).toEqual(mockMedia);
    });

    it('includes the file in FormData', async () => {
      const json = vi.fn().mockResolvedValue(mockMedia);
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      await service.upload(file);

      const formData: FormData = postMock.mock.calls[0][1].body;
      expect(formData.get('file')).toBe(file);
    });

    it('includes the title in FormData when provided', async () => {
      const json = vi.fn().mockResolvedValue(mockMedia);
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      await service.upload(file, 'My Photo');

      const formData: FormData = postMock.mock.calls[0][1].body;
      expect(formData.get('title')).toBe('My Photo');
    });

    it('omits title from FormData when not provided', async () => {
      const json = vi.fn().mockResolvedValue(mockMedia);
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      await service.upload(file);

      const formData: FormData = postMock.mock.calls[0][1].body;
      expect(formData.get('title')).toBeNull();
    });
  });

  describe('delete', () => {
    it('calls DELETE media/:id', async () => {
      await service.delete('media-1');

      expect(ky.delete).toHaveBeenCalledWith('media/media-1');
    });
  });
});
