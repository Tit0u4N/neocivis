import { optionalEnv } from '@/infrastructure/env';

function parseBool(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }
  const v = raw.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function isInMemoryMode(): boolean {
  return parseBool(optionalEnv('IN_MEMORY'));
}

