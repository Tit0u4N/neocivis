import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  // Inline workspace packages from `packages/` (not published to npm); default tsup
  // treats package.json dependencies as external.
  noExternal: [/^@repo\//],
});
