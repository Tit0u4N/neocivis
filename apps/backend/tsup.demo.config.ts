import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'esbuild';
import { defineConfig } from 'tsup';

/**
 * Bundle « démo » : backend complet (IN_MEMORY + seeds) exécutable dans le navigateur.
 * Consommé par les frontends en mode démo (hébergement statique, ex: GitHub Pages).
 */
const stubsDir = resolve(__dirname, 'src/demo/stubs');

/** Modules remplacés par un proxy inerte (jamais appelés en mode IN_MEMORY). */
const UNIVERSAL_STUBS = [
  /^@azure\//,
  /^@marplex\//,
  /^postgres$/,
  /^drizzle-orm(\/.*)?$/,
  /^groq-sdk$/,
  /^dotenv$/,
  /^node:(fs|fs\/promises|path|readline\/promises)$/,
];

/** Modules internes remplacés par une implémentation navigateur. */
const MODULE_OVERRIDES: Record<string, string> = {
  'node:crypto': resolve(stubsDir, 'node-crypto.ts'),
  'node:process': resolve(stubsDir, 'node-process.ts'),
  '@/infrastructure/media/image-seed-cache': resolve(stubsDir, 'image-seed-cache.ts'),
  '@/modules/iam/keycloak-iam.service': resolve(stubsDir, 'keycloak-iam.service.ts'),
};

/** Collecte les noms importés (`import { a, b } from 'mod'`) par module, pour générer des stubs ESM. */
function collectNamedImports(dir: string, acc = new Map<string, Set<string>>()): Map<string, Set<string>> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectNamedImports(full, acc);
    } else if (entry.name.endsWith('.ts')) {
      const source = readFileSync(full, 'utf8');
      for (const m of source.matchAll(/import\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
        const names = acc.get(m[2]) ?? new Set<string>();
        for (const raw of m[1].split(',')) {
          const name = raw
            .trim()
            .replace(/^type\s+/, '')
            .split(/\s+as\s+/)[0];
          if (name) {
            names.add(name);
          }
        }
        acc.set(m[2], names);
      }
    }
  }
  return acc;
}

const demoStubsPlugin: Plugin = {
  name: 'demo-stubs',
  setup(build) {
    const namedImports = collectNamedImports(resolve(__dirname, 'src'));
    build.onResolve({ filter: /.*/ }, (args) => {
      if (MODULE_OVERRIDES[args.path]) {
        return { path: MODULE_OVERRIDES[args.path] };
      }
      if (UNIVERSAL_STUBS.some((re) => re.test(args.path))) {
        return { path: args.path, namespace: 'demo-stub' };
      }
      return undefined;
    });
    build.onLoad({ filter: /.*/, namespace: 'demo-stub' }, (args) => {
      const names = [...(namedImports.get(args.path) ?? [])];
      const exports = names.map((n) => `export const ${n} = stub;`).join('\n');
      return {
        contents: `import stub from ${JSON.stringify(resolve(stubsDir, 'universal.js'))};\n${exports}\nexport default stub;`,
        loader: 'js',
        resolveDir: stubsDir,
      };
    });
  },
};

export default defineConfig({
  entry: { 'demo-api': 'src/demo/demo-api.ts' },
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist-demo',
  clean: true,
  dts: true,
  // Tout est inliné : le bundle doit être autonome côté frontend.
  noExternal: [/.*/],
  loader: { '.jpg': 'base64' },
  inject: [resolve(stubsDir, 'buffer-shim.ts')],
  define: {
    'process.env': JSON.stringify({ IN_MEMORY: 'true', ENV_MODE: 'demo' }),
  },
  // Garder le préfixe `node:` pour que le plugin puisse substituer `node:crypto`.
  removeNodeProtocol: false,
  esbuildPlugins: [demoStubsPlugin],
});
