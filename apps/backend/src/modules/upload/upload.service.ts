import { randomUUID } from 'node:crypto';
import { getBlobServiceClient, getUploadsContainerName } from '@/infrastructure/azure/blob.client';
import { ContainerName } from '@/infrastructure/containers';

export interface IUploadService {
  uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string): Promise<string>;
}

export class AzureBlobUploadService implements IUploadService {
  async uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string): Promise<string> {
    const service = getBlobServiceClient(ContainerName.ARTICLES);
    const containerName = getUploadsContainerName(ContainerName.ARTICLES);
    const container = service.getContainerClient(containerName);
    await container.createIfNotExists({
      access: 'blob'
    });
    await container.setAccessPolicy('blob');

    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const blobName = `${randomUUID()}${ext}`;

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
  async uploadImage(_buffer: ArrayBuffer, filename: string, _mimeType: string): Promise<string> {
    const seed = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-');
    return `https://picsum.photos/seed/${seed}/800/400`;
  }
}
