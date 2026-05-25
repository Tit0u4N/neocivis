/** Strips quotes and trailing commas often introduced by copy-paste in .env files. */
function sanitizeEnvValue(value: string): string {
  return value
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/,+$/g, '')
    .trim();
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return undefined;
  }
  const sanitized = sanitizeEnvValue(value);
  return sanitized.length === 0 ? undefined : sanitized;
}

export function requiredEnv(name: string): string {
  const value = optionalEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

//todo: add a fonction to detect if all required env variables are set, depending on the env mode
