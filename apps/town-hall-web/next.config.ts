import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/contracts', '@repo/frontend-core', '@repo/frontend-services'],
};

export default nextConfig;
