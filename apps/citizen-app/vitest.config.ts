import path from 'node:path';
import { reactConfig } from '@repo/vitest-config/react';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  reactConfig,
  defineConfig({
    plugins: [
      react({
        babel: {
          plugins: ['@babel/plugin-transform-flow-strip-types'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-native': path.resolve(__dirname, './src/__tests__/react-native-mock.ts'),
      },
    },
    test: {
      setupFiles: ['./vitest.setup.ts'],
      server: {
        deps: {
          // Force transform RNTL through Vite to handle its TypeScript source maps
          inline: ['@testing-library/react-native'],
        },
      },
    },
  }),
);
