import { withGluestackUI } from '@gluestack/ui-next-adapter';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-native$": "react-native-web",
    },
    resolveExtensions: [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@repo/ui', '@gluestack-ui/themed', 'react-native-web'],
};

export default withGluestackUI(nextConfig);
