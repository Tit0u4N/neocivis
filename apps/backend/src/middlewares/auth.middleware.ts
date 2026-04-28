import type { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { isInMemoryMode } from '@/core/runtime-config';
import type { UserService } from '@/modules/users/user.service';
import type { BaseUserRole } from '@/modules/users/user.types';

function normalizeRoles(rolesHeaderValue: string): string[] {
  return rolesHeaderValue
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.toUpperCase());
}

function getBaseRole(roles: string[]): BaseUserRole {
  if (roles.includes('ADMIN')) {
    return 'ADMIN';
  }
  if (roles.includes('EMPLOYEE')) {
    return 'EMPLOYEE';
  }
  return 'CITIZEN';
}

/**
 * Extract `X-User-Id` / `X-User-Roles` and exposes them through `c.var.user`.
 * Also upserts the user in SQL (Drizzle) when DB is configured.
 */
export function applyUserMiddleware(app: Hono, userService: UserService) {
  app.use(
    '*',
    createMiddleware(async (c, next) => {
      const keycloakId = c.req.header('X-User-Id');
      const roles = normalizeRoles(c.req.header('X-User-Roles') ?? '');
      const username = c.req.header('X-User-Username') ?? undefined;
      const email = c.req.header('X-User-Email') ?? undefined;
      const firstName = c.req.header('X-User-First-Name') ?? undefined;
      const lastName = c.req.header('X-User-Last-Name') ?? undefined;

      if (keycloakId) {
        const baseRole = getBaseRole(roles);

        let resolvedUsername = username;
        let resolvedEmail = email;
        let resolvedFirstName = firstName;
        let resolvedLastName = lastName;

        if (
          c.var.db &&
          (resolvedUsername === undefined ||
            resolvedEmail === undefined ||
            resolvedFirstName === undefined ||
            resolvedLastName === undefined)
        ) {
          const profile = await userService.getIamProfileByKeycloakId(keycloakId);
          resolvedUsername ??= profile?.username;
          resolvedEmail ??= profile?.email;
          resolvedFirstName ??= profile?.firstName;
          resolvedLastName ??= profile?.lastName;
        }

        c.set('user', {
          keycloakId,
          roles,
          baseRole,
          username: resolvedUsername,
          email: resolvedEmail,
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
        });

        // Sync si DB branchée, ou si on est en mode in-memory (repository in-memory).
        if (c.var.db || isInMemoryMode()) {
          await userService.syncFromHeaders({
            keycloakId,
            role: baseRole,
            username: resolvedUsername,
            email: resolvedEmail,
            firstName: resolvedFirstName,
            lastName: resolvedLastName,
          });
        }
      }

      await next();
    }),
  );

  return app;
}
