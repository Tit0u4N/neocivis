const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

// Mode démo statique : `@demo-api` → backend en mémoire (apps/backend/dist-demo, via `bun run build:demo`).
// Hors démo, l'alias pointe vers un stub et rien du backend n'est embarqué.
const isDemo = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const demoApiPath = isDemo
  ? path.resolve(monorepoRoot, 'apps/backend/dist-demo/demo-api.js')
  : path.resolve(projectRoot, 'src/demo/demo-api.stub.ts');
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@demo-api') {
    return { type: 'sourceFile', filePath: demoApiPath };
  }
  return upstreamResolveRequest
    ? upstreamResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
