import { BlobServiceClient } from '@azure/storage-blob';
import { ContainerName } from '../containers';
import { optionalEnv, requiredEnv } from '../env';

export type ContainerClient = {
  name: ContainerName;
  client: BlobServiceClient;
};

const singletons: ContainerClient[] = [];

export function getBlobServiceClient(name: ContainerName): BlobServiceClient {
  const singleton = singletons.find((s) => s.name === name);
  if (singleton) {
    return singleton.client;
  }
  const conn = requiredEnv('AZURE_STORAGE_CONNECTION_STRING');
  const client = BlobServiceClient.fromConnectionString(conn);
  const container = client.getContainerClient(getUploadsContainerName(name));
  void container.createIfNotExists({ access: 'blob' }).catch(() => {
    // Azurite may reject access policies; container creation is retried on upload.
  });
  singletons.push({ name, client });
  return client;
}

export function getUploadsContainerName(name: ContainerName): string {
  switch (name) {
    case ContainerName.Media:
      return requiredEnv('AZURE_MEDIA_STORAGE_CONTAINER');
    default:
      throw new Error(`Container ${name} not found`);
  }
}

export function getPublicBlobUrl(storagePath: string): string {
  const baseUrl = optionalEnv('AZURE_STORAGE_BASE_URL')?.replace(/\/$/, '');
  const container = getUploadsContainerName(ContainerName.Media);
  if (!baseUrl) {
    throw new Error('AZURE_STORAGE_BASE_URL is required to build public blob URLs');
  }
  return `${baseUrl}/${container}/${storagePath}`;
}
