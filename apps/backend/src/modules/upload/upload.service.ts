import type { IMediaBlobService } from '@/modules/media/media-blob.service';

export interface IUploadService {
  uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string, cityId?: string): Promise<string>;
}

export class AzureBlobUploadService implements IUploadService {
  constructor(private readonly mediaBlobService: IMediaBlobService) {}

  async uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string, cityId?: string): Promise<string> {
    const scope = cityId?.trim() ? cityId.trim() : 'reports';
    const uploaded = await this.mediaBlobService.uploadImageFromScope(buffer, filename, mimeType, scope);
    return uploaded.url;
  }
}

export class StubUploadService implements IUploadService {
  // biome-ignore lint/suspicious/useAwait: stub
  async uploadImage(_buffer: ArrayBuffer, filename: string, _mimeType: string, cityId?: string): Promise<string> {
    const seed = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-');
    const scope = cityId?.trim() ? cityId.trim() : 'reports';
    return `https://picsum.photos/seed/${scope}-${seed}/800/400`;
  }
}
