// Équivalent navigateur de `node:process` pour le bundle démo (seul `env` est utilisé).
export const env: Record<string, string | undefined> = { IN_MEMORY: 'true', ENV_MODE: 'demo' };
export default { env };
