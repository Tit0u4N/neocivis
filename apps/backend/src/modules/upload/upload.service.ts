// Interface to implement when Azure Blob Storage is configured:
//
//   import { BlobServiceClient } from '@azure/storage-blob';
//   const client = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
//   const container = client.getContainerClient(process.env.AZURE_STORAGE_CONTAINER);
//   await container.uploadBlockBlob(filename, buffer, buffer.length, { blobHTTPHeaders: { blobContentType: mimeType } });
//   return `${process.env.AZURE_STORAGE_BASE_URL}/${container.containerName}/${filename}`;

export interface IUploadService {
  uploadImage(buffer: ArrayBuffer, filename: string, mimeType: string): Promise<string>;
}

export class StubUploadService implements IUploadService {
  // TODO: replace with AzureBlobUploadService once storage is configured
  // biome-ignore lint/suspicious/useAwait: This is a stub implementation that simulates an async upload.
  async uploadImage(_buffer: ArrayBuffer, filename: string, _mimeType: string): Promise<string> {
    const seed = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-');
    return `https://picsum.photos/seed/${seed}/800/400`;
  }
}
