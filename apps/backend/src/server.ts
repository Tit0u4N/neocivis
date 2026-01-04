/** biome-ignore-all lint/suspicious/noConsole: Backend set up file */
import { serve } from '@hono/node-server';
import app from './app';

serve({
 fetch: app.fetch,
 port: 3000,
});

console.log('🔥 Hono dev server (hot reload via vite-node) → http://localhost:3000');
