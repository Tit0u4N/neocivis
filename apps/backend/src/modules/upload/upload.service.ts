import { randomUUID } from 'node:crypto';
import { getBlobServiceClient, getUploadsContainerName } from '@/infrastructure/azure/blob.client';
import { ContainerName } from '@/infrastructure/containers';

export interface IUploadService {
  uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string, cityId?: string): Promise<string>;
}

export class AzureBlobUploadService implements IUploadService {
  constructor(private containerName: ContainerName = ContainerName.Articles) {}

  async uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string, cityId?: string): Promise<string> {
    const service = getBlobServiceClient(this.containerName);
    const containerNameStr = getUploadsContainerName(this.containerName);
    const container = service.getContainerClient(containerNameStr);
    await container.createIfNotExists({
      access: 'blob',
    });
    await container.setAccessPolicy('blob');

    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const scope = cityId?.trim() ? cityId.trim() : 'global';
    const blobName = `${scope}/${randomUUID()}${ext}`;

    const blockBlob = container.getBlockBlobClient(blobName);
    await blockBlob.uploadData(Buffer.from(buffer), {
      blobHTTPHeaders: { blobContentType: mimeType },
    });
    return blockBlob.url;
  }
}

export class StubUploadService implements IUploadService {
  // TODO: replace with AzureBlobUploadService once storage is configured
  // biome-ignore lint/suspicious/useAwait: This is a stub implementation that simulates an async upload.
  async uploadImage(_buffer: ArrayBuffer, filename: string, _mimeType: string, cityId?: string): Promise<string> {
    const seed = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-');
    const scope = cityId?.trim() ? cityId.trim() : 'global';
    return `https://picsum.photos/seed/${scope}-${seed}/800/400`;
  }
}
