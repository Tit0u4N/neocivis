import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const CACHE_DIR = resolve(process.cwd(), 'local-data/temp');

export async function getCachedImageBuffer(sourceUrl: string, cacheKey: string): Promise<Buffer> {
  await mkdir(CACHE_DIR, { recursive: true });
  const safeName = createHash('sha256').update(cacheKey).digest('hex');
  const cachePath = join(CACHE_DIR, `${safeName}.bin`);

  if (existsSync(cachePath)) {
    return readFile(cachePath);
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download seed image (${response.status}): ${sourceUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(cachePath, buffer);
  return buffer;
}
