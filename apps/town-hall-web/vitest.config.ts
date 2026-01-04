import { reactConfig } from '@repo/vitest-config/react';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
 reactConfig,
 defineConfig({
  plugins: [react()],
  resolve: {
   alias: {
    '@': './src',
   },
  },
 }),
);
