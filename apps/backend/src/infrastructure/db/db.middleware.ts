import type { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { optionalEnv } from '@/infrastructure/env';
import { isInMemoryMode } from '@/core/runtime-config';
import { getDb } from './client';

/** Ajoute `c.var.db` lorsque `DATABASE_URL` est défini (sinon noop). */
export function applyDbMiddleware(app: Hono) {
  if (isInMemoryMode()) {
    return app;
  }
  if (!optionalEnv('DATABASE_URL')) {
    throw new Error('DATABASE_URL is not set');
  }
  app.use(
    '*',
    createMiddleware(async (c, next) => {
      c.set('db', getDb());
      await next();
    }),
  );
  return app;
}
