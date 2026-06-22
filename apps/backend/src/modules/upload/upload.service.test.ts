import { describe, expect, it, vi } from 'vitest';
import type { IMediaBlobService } from '@/modules/media/media-blob.service';
import { AzureBlobUploadService, StubUploadService } from './upload.service';

describe('StubUploadService', () => {
  const service = new StubUploadService();

  it('returns a picsum URL', async () => {
    const url = await service.uploadImage(new ArrayBuffer(0), 'photo.jpg', 'image/jpeg');
    expect(url).toMatch(/picsum\.photos/);
  });

  it('uses cityId as scope when provided', async () => {
    const url = await service.uploadImage(new ArrayBuffer(0), 'shot.jpg', 'image/jpeg', 'NIC_00001');
    expect(url).toContain('NIC_00001');
  });

  it('defaults to "reports" scope when cityId is absent', async () => {
    const url = await service.uploadImage(new ArrayBuffer(0), 'photo.jpg', 'image/jpeg');
    expect(url).toContain('reports');
  });

  it('defaults to "reports" scope when cityId is an empty string', async () => {
    const url = await service.uploadImage(new ArrayBuffer(0), 'photo.jpg', 'image/jpeg', '');
    expect(url).toContain('reports');
    expect(url).not.toContain('undefined');
  });

  it('defaults to "reports" scope when cityId is whitespace only', async () => {
    const url = await service.uploadImage(new ArrayBuffer(0), 'photo.jpg', 'image/jpeg', '   ');
    expect(url).toContain('reports');
  });

  it('derives the seed from the filename without extension', async () => {
    const url = await service.uploadImage(new ArrayBuffer(0), 'my-photo.jpg', 'image/jpeg', 'NIC_00001');
    expect(url).toContain('my-photo');
  });
});

describe('AzureBlobUploadService', () => {
  function makeService(overrides: Partial<IMediaBlobService> = {}) {
    const mediaBlobService: IMediaBlobService = {
      uploadImage: vi.fn(),
      uploadImageFromScope: vi.fn(async (_buf, _filename, _mime, scopePath) => ({
        url: `https://blob.test/${scopePath}/uuid.jpg`,
        storagePath: `${scopePath}/uuid.jpg`,
      })),
      uploadToStoragePath: vi.fn(),
      deleteByStoragePath: vi.fn(),
      getProfilePicturePlaceholderUrl: vi.fn(() => ''),
      ...overrides,
    };
    return { service: new AzureBlobUploadService(mediaBlobService), mediaBlobService };
  }

  it('returns the url provided by the blob service', async () => {
    const { service } = makeService();
    const url = await service.uploadImage(new ArrayBuffer(8), 'photo.jpg', 'image/jpeg', 'NIC_00001');
    expect(url).toContain('NIC_00001');
  });

  it('delegates to uploadImageFromScope with the cityId as scope', async () => {
    const { service, mediaBlobService } = makeService();
    await service.uploadImage(new ArrayBuffer(8), 'photo.jpg', 'image/jpeg', 'NIC_00001');
    expect(mediaBlobService.uploadImageFromScope).toHaveBeenCalledWith(
      expect.anything(),
      'photo.jpg',
      'image/jpeg',
      'NIC_00001',
    );
  });

  it('uses "reports" scope when cityId is absent', async () => {
    const { service, mediaBlobService } = makeService();
    await service.uploadImage(new ArrayBuffer(8), 'photo.jpg', 'image/jpeg');
    expect(mediaBlobService.uploadImageFromScope).toHaveBeenCalledWith(
      expect.anything(),
      'photo.jpg',
      'image/jpeg',
      'reports',
    );
  });

  it('uses "reports" scope when cityId is whitespace only', async () => {
    const { service, mediaBlobService } = makeService();
    await service.uploadImage(new ArrayBuffer(8), 'photo.jpg', 'image/jpeg', '   ');
    expect(mediaBlobService.uploadImageFromScope).toHaveBeenCalledWith(
      expect.anything(),
      'photo.jpg',
      'image/jpeg',
      'reports',
    );
  });
});
