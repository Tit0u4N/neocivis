import { randomUUID } from 'node:crypto';
import type { MediaImage } from '@repo/contracts/media';
import type { IUploadService } from '@/modules/upload/upload.service';
import type { IMediaRepository } from '../repository/media.repository.interface';

export class MediaService {
  constructor(
    private readonly repository: IMediaRepository,
    private readonly uploadService: IUploadService,
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
    const url = await this.uploadService.uploadImage(buffer, filename, mimeType, cityId);
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const storagePath = `${cityId}/${randomUUID()}${ext}`;
    const media: MediaImage = {
      id: randomUUID(),
      title: title ?? filename,
      url,
      storagePath,
      cityId,
      createdAt: new Date().toISOString(),
      links: [],
    };
    return this.repository.create(media);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Media not found: ${id}`);
    }
  }

  async getById(id: string): Promise<MediaImage> {
    const media = await this.repository.findById(id);
    if (!media) {
      throw new Error(`Media not found: ${id}`);
    }
    return media;
  }
}
