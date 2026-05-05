import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/contracts', '@repo/frontend-core', '@repo/frontend-services'],
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    serverSourceMaps: false,
  },
};

export default nextConfig;
