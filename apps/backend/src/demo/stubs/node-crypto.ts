// Équivalent navigateur de `node:crypto` pour le bundle démo.
export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}
