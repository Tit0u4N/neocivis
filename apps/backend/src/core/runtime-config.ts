import { optionalEnv } from '@/infrastructure/env';

function parseBool(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }
  const v = raw.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

let isInMemoryModeCache: boolean | null = null;

export function isInMemoryMode(): boolean {
  if (isInMemoryModeCache !== null) {
    return isInMemoryModeCache;
  }
  isInMemoryModeCache = parseBool(optionalEnv('IN_MEMORY'));
  if (isInMemoryModeCache) {
    // biome-ignore lint/suspicious/noConsole: startup diagnostics
    console.warn('WARNING: IN_MEMORY is enabled, data will not be persisted between restarts.');
  }
  return isInMemoryModeCache;
}

export type AutoSeedMode = 'INSERT_ONLY' | 'RESET_DATA';

export function getAutoSeedMode(): AutoSeedMode | null {
  const raw = optionalEnv('AUTO_SEED') ?? optionalEnv('auto_seed');
  if (!raw) {
    return null;
  }
  const v = raw.trim().toUpperCase();
  if (v === 'INSERT_ONLY' || v === 'RESET_DATA') {
    return v;
  }
  return null;
}
