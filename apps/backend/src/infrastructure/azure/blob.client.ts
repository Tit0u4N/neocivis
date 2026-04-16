import { BlobServiceClient } from '@azure/storage-blob';
import { optionalEnv, requiredEnv } from '../env';
import { ContainerName } from '../containers';


export type ContainerClient = {
  name: ContainerName;
  client: BlobServiceClient;
}

const singletons: ContainerClient[] = [];

export function getBlobServiceClient(name: ContainerName): BlobServiceClient {
  const singleton = singletons.find(s => s.name === name);
  if (singleton) {
    return singleton.client;
  }
  const conn = requiredEnv('AZURE_STORAGE_CONNECTION_STRING');
  const client = BlobServiceClient.fromConnectionString(conn);
  client.getContainerClient(getUploadsContainerName(name)).createIfNotExists();
  singletons.push({ name, client });
  return client;
}

export function getUploadsContainerName(name: ContainerName): string {
  switch (name) {
    case ContainerName.ARTICLES:
      return requiredEnv('AZURE_ARTICLES_STORAGE_CONTAINER');
    default:
      throw new Error(`Container ${name} not found`);
  }
}

export function getBaseUrl(name: ContainerName): string {
  return`${optionalEnv('AZURE_STORAGE_BASE_URL')}/${getUploadsContainerName(name)}`;
}