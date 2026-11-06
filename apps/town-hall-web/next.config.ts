import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Mode démo statique (`NEXT_PUBLIC_DEMO_MODE=true`) : export HTML statique (GitHub Pages),
 * backend en mémoire embarqué via l'alias `@demo-api` → `apps/backend/dist-demo/demo-api.js`.
 */
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const demoApiPath = isDemo
  ? path.resolve(__dirname, '../backend/dist-demo/demo-api.js')
  : path.resolve(__dirname, 'src/demo/demo-api.stub.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/contracts', '@repo/frontend-core', '@repo/frontend-services'],
  ...(isDemo && {
    output: 'export',
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  turbopack: {
    resolveAlias: {
      '@demo-api': path.relative(__dirname, demoApiPath).startsWith('.')
        ? path.relative(__dirname, demoApiPath)
        : `./${path.relative(__dirname, demoApiPath)}`,
    },
  },
  webpack: (config) => {
    config.resolve.alias['@demo-api'] = demoApiPath;
    return config;
  },
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    serverSourceMaps: false,
  },
};

export default nextConfig;
