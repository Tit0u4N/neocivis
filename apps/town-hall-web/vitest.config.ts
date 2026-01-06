import { reactConfig } from '@repo/vitest-config/react';
import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(reactConfig, {
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
