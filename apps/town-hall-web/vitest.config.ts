import path from 'node:path';
import { reactConfig } from '@repo/vitest-config/react';
import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(reactConfig, {
  plugins: [react()],
  resolve: {
    alias: {
      '@demo-api': path.resolve(__dirname, './src/demo/demo-api.stub.ts'),
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    server: {
      deps: {
        // Force locally-installed packages through Vite so the react alias applies
        inline: [/@base-ui\/react/],
      },
    },
  },
});
