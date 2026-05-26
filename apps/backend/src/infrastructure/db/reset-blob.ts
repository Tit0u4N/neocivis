import { BlobServiceClient } from '@azure/storage-blob';
import { optionalEnv } from '@/infrastructure/env';

const LEGACY_ARTICLES_CONTAINER = 'articles';

export function isBlobStorageConfigured(): boolean {
  return Boolean(optionalEnv('AZURE_STORAGE_CONNECTION_STRING'));
}

/**
 * Deletes and recreates the media blob container (and legacy `articles` if present).
 */
export async function resetBlobStorage(): Promise<void> {
  const connectionString = optionalEnv('AZURE_STORAGE_CONNECTION_STRING');
  if (!connectionString) {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('[db:reset:blob] AZURE_STORAGE_CONNECTION_STRING not set; skipping');
    return;
  }

  const containerName = optionalEnv('AZURE_MEDIA_STORAGE_CONTAINER');
  if (!containerName) {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info('[db:reset:blob] AZURE_MEDIA_STORAGE_CONTAINER not set; skipping');
    return;
  }

  const client = BlobServiceClient.fromConnectionString(connectionString);
  const containersToReset = [containerName, LEGACY_ARTICLES_CONTAINER];

  for (const name of containersToReset) {
    const container = client.getContainerClient(name);
    const deleted = await container.deleteIfExists();
    if (deleted.deleted) {
      // biome-ignore lint/suspicious/noConsole: script CLI
      console.info(`[db:reset:blob] container deleted (container=${name})`);
    }
  }

  const mediaContainer = client.getContainerClient(containerName);
  await mediaContainer.createIfNotExists({ access: 'blob' });
  await mediaContainer.setAccessPolicy('blob');
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(`[db:reset:blob] container ensured (container=${containerName})`);
}
