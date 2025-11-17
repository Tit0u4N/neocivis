# metro-cache-key

Utility used by our Metro (React Native / Expo) projects to produce a
deterministic cache key. The helper hashes the full path, size, mtime, and file
contents of every file you pass to it, and then combines those hashes into a
single SHA-1 digest. Metro uses this digest to know when a change requires the
packager cache to be invalidated.

## Usage

```js
const metroCacheKey = require('metro-cache-key');

const cacheKey = metroCacheKey([
  require.resolve('./metro.config.js'),
  require.resolve('./package.json'),
]);

module.exports.getCacheKey = () => cacheKey;
```

Call the function with the list of config files (Babel, Metro, TS config, etc.)
that should cause Metro to rebuild when they change. Missing files are handled
gracefully: they contribute the literal string `missing` to the hash so that
the key still changes if a file is deleted.

## When to update the key

Whenever you add a new configuration file that Metro depends on, append it to
the `files` array passed to `metroCacheKey`. That way, Metro will rerun the
packager whenever that file is touched. No other maintenance is required.

