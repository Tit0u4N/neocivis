import { withGluestackUI } from '@gluestack/ui-next-adapter';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  transpilePackages: [],
};

export default nextConfig;
