import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
 entry: {
  index: 'src/index.ts',
  node: 'src/node.ts',
  react: 'src/react.ts',
 },
 clean: true,
 format: ['cjs', 'esm'],
 dts: false,
 external: ['vitest', 'vitest/config', '@vitejs/plugin-react'],
 ...options,
}));
