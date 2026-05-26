import { randomUUID } from 'node:crypto';
import type { MediaImage } from '@repo/contracts/media';
import type { IMediaBlobService } from '../media-blob.service';
import type { IMediaRepository } from '../repository/media.repository.interface';

export class MediaService {
  constructor(
    private readonly repository: IMediaRepository,
    private readonly blobService: IMediaBlobService,
  ) {}

  getAllByCityId(cityId: string): Promise<MediaImage[]> {
    return this.repository.findByCityId(cityId);
  }

  async upload(
    cityId: string,
    buffer: ArrayBuffer,
    filename: string,
    mimeType: string,
    title?: string,
  ): Promise<MediaImage> {
    const uploaded = await this.blobService.uploadImage(buffer, filename, mimeType, cityId);
    const media: MediaImage = {
      id: randomUUID(),
      title: title ?? filename,
      url: uploaded.url,
      storagePath: uploaded.storagePath,
      cityId,
      createdAt: new Date().toISOString(),
      links: [],
    };
    return this.repository.create(media);
  }

  async delete(cityId: string, id: string): Promise<void> {
    const media = await this.repository.findByIdAndCityId(id, cityId);
    if (!media) {
      throw new Error(`Media not found: ${id}`);
    }
    await this.blobService.deleteByStoragePath(media.storagePath);
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Media not found: ${id}`);
    }
  }

  async getById(cityId: string, id: string): Promise<MediaImage> {
    const media = await this.repository.findByIdAndCityId(id, cityId);
    if (!media) {
      throw new Error(`Media not found: ${id}`);
    }
    return media;
  }
}
