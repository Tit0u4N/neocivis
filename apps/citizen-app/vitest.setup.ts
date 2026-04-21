import Module from 'node:module';

// RNTL's compiled CJS files call require("react-native") directly, bypassing
// Vite's alias. Patch Node's CJS resolver so those calls land on react-native-web.
// biome-ignore lint/suspicious/noExplicitAny: internal Node API
const origResolve = (Module as any)._resolveFilename.bind(Module);
// biome-ignore lint/suspicious/noExplicitAny: internal Node API
(Module as any)._resolveFilename = (request: string, ...rest: unknown[]) =>
  origResolve(request === 'react-native' ? 'react-native-web' : request, ...rest);
