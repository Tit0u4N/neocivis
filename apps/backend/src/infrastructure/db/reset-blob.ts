import type { ContainerClient } from '@azure/storage-blob';
import { BlobServiceClient } from '@azure/storage-blob';
import { optionalEnv } from '@/infrastructure/env';

const LEGACY_ARTICLES_CONTAINER = 'articles';

export function isBlobStorageConfigured(): boolean {
  return Boolean(optionalEnv('AZURE_STORAGE_CONNECTION_STRING'));
}

async function clearContainer(container: ContainerClient): Promise<void> {
  let count = 0;
  for await (const blob of container.listBlobsFlat()) {
    await container.deleteBlob(blob.name);
    count++;
  }
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(`[db:reset:blob] container cleared (container=${container.containerName}, count=${count})`);
}

/**
 * Empties all blobs from the media blob container (and legacy `articles` if present).
 * Containers themselves are kept intact.
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

  const mediaContainer = client.getContainerClient(containerName);
  if (await mediaContainer.exists()) {
    await clearContainer(mediaContainer);
  } else {
    await mediaContainer.createIfNotExists({ access: 'blob' });
    try {
      await mediaContainer.setAccessPolicy('blob');
    } catch {
      // Azurite emulator does not support container ACLs
    }
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info(`[db:reset:blob] container created (container=${containerName})`);
  }

  const legacyContainer = client.getContainerClient(LEGACY_ARTICLES_CONTAINER);
  if (await legacyContainer.exists()) {
    await clearContainer(legacyContainer);
  }
}
