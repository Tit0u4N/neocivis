import { randomUUID } from 'node:crypto';
import { getBlobServiceClient, getPublicBlobUrl, getUploadsContainerName } from '@/infrastructure/azure/blob.client';
import { ContainerName } from '@/infrastructure/containers';

export type UploadedBlob = {
  url: string;
  storagePath: string;
};

export const PROFILE_PICTURE_PLACEHOLDER_PATH = 'profile-pictures/placeholder.jpg';

export interface IMediaBlobService {
  uploadImage(buffer: ArrayBuffer | Buffer, filename: string, mimeType: string, cityId: string): Promise<UploadedBlob>;
  uploadImageFromScope(
    buffer: ArrayBuffer | Buffer,
    filename: string,
    mimeType: string,
    scopePath: string,
  ): Promise<UploadedBlob>;
  uploadToStoragePath(buffer: ArrayBuffer | Buffer, mimeType: string, storagePath: string): Promise<UploadedBlob>;
  deleteByStoragePath(storagePath: string): Promise<void>;
  getProfilePicturePlaceholderUrl(): string;
}

export class AzureMediaBlobService implements IMediaBlobService {
  async uploadImage(
    buffer: ArrayBuffer | Buffer,
    filename: string,
    mimeType: string,
    cityId: string,
  ): Promise<UploadedBlob> {
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const storagePath = `${cityId.trim()}/${randomUUID()}${ext}`;
    return await this.uploadToStoragePath(buffer, mimeType, storagePath);
  }

  async uploadImageFromScope(
    buffer: ArrayBuffer | Buffer,
    filename: string,
    mimeType: string,
    scopePath: string,
  ): Promise<UploadedBlob> {
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const storagePath = `${scopePath.replace(/\/$/, '')}/${randomUUID()}${ext}`;
    return await this.uploadToStoragePath(buffer, mimeType, storagePath);
  }

  async uploadToStoragePath(
    buffer: ArrayBuffer | Buffer,
    mimeType: string,
    storagePath: string,
  ): Promise<UploadedBlob> {
    const service = getBlobServiceClient(ContainerName.Media);
    const containerName = getUploadsContainerName(ContainerName.Media);
    const container = service.getContainerClient(containerName);
    await container.createIfNotExists({ access: 'blob' });
    try {
      await container.setAccessPolicy('blob');
    } catch {
      // Azurite emulator does not support container ACLs; blobs remain reachable via URL.
    }

    const blockBlob = container.getBlockBlobClient(storagePath);
    const body = buffer instanceof Buffer ? buffer : Buffer.from(buffer);
    if (body.length === 0) {
      throw new Error(`Refusing to upload empty blob: ${storagePath}`);
    }
    await blockBlob.uploadData(body, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    const exists = await blockBlob.exists();
    if (!exists) {
      throw new Error(`Blob upload reported success but blob is missing: ${containerName}/${storagePath}`);
    }

    return {
      storagePath,
      url: getPublicBlobUrl(storagePath),
    };
  }

  async deleteByStoragePath(storagePath: string): Promise<void> {
    const service = getBlobServiceClient(ContainerName.Media);
    const containerName = getUploadsContainerName(ContainerName.Media);
    const container = service.getContainerClient(containerName);
    await container.getBlockBlobClient(storagePath).deleteIfExists();
  }

  getProfilePicturePlaceholderUrl(): string {
    return getPublicBlobUrl(PROFILE_PICTURE_PLACEHOLDER_PATH);
  }
}

export class PicsumMediaBlobService implements IMediaBlobService {
  uploadImage(
    _buffer: ArrayBuffer | Buffer,
    filename: string,
    _mimeType: string,
    cityId: string,
  ): Promise<UploadedBlob> {
    const seed = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-');
    const storagePath = `${cityId.trim()}/${seed}.jpg`;
    const url = `https://picsum.photos/seed/${cityId}-${seed}/800/500`;
    return Promise.resolve({ url, storagePath });
  }

  uploadImageFromScope(
    _buffer: ArrayBuffer | Buffer,
    filename: string,
    _mimeType: string,
    scopePath: string,
  ): Promise<UploadedBlob> {
    const seed = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-');
    const storagePath = `${scopePath}/${seed}.jpg`;
    const url = `https://picsum.photos/seed/${scopePath}-${seed}/800/500`;
    return Promise.resolve({ url, storagePath });
  }

  uploadToStoragePath(_buffer: ArrayBuffer | Buffer, _mimeType: string, storagePath: string): Promise<UploadedBlob> {
    const seed = storagePath.replace(/[^a-z0-9]/gi, '-');
    const url = `https://picsum.photos/seed/${seed}/800/500`;
    return Promise.resolve({ url, storagePath });
  }

  deleteByStoragePath(_storagePath: string): Promise<void> {
    return Promise.resolve();
  }

  getProfilePicturePlaceholderUrl(): string {
    const seed = PROFILE_PICTURE_PLACEHOLDER_PATH.replace(/[^a-z0-9]/gi, '-');
    return `https://picsum.photos/seed/${seed}/800/500`;
  }
}
