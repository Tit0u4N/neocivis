import type { ApiErrorDto, PermissionKey } from '@repo/contracts';
import { createMiddleware } from 'hono/factory';
import type { AccessService } from '@/modules/access/access.service';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';

// biome-ignore lint/suspicious/noExplicitAny: Hono's `createMiddleware` infers
// a single response type from the first c.json(...) call. The middlewares
// below return JSON with multiple HTTP statuses (400/401/403/404), so we
// route every error response through these helpers typed as `(c: any)` to
// defeat the inference (same pattern as `city-access.middleware.ts`).
function jsonError(c: any, status: number, message: string) {
  const body: ApiErrorDto = { error: message };
  return c.json(body, status);
}

/**
 * Middleware factory : exige une permission donnée pour la `cityId` lue
 * dans les params de route. Doit être monté SOUS un sous-routeur city-scoped
 * (ex. `app.route('/cities/:cityId', cityScoped)`).
 *
 * Règles :
 *  - ADMIN d'une city -> bypass.
 *  - EMPLOYEE d'une city -> nécessite la permission via un de ses rôles.
 *  - sinon -> 403.
 */
export function requirePermission(permissionKey: PermissionKey, accessService: AccessService, userService: UserService) {
  return createMiddleware(async (c, next) => {
    const cityId = c.req.param('cityId');
    if (!cityId) {
      return jsonError(c, 400, 'Missing cityId in route params');
    }

    const requestUser = c.var.user;
    if (!requestUser) {
      return jsonError(c, 401, 'Unauthorized: No user information found');
    }

    const dbUser = await userService.getByKeycloakId(requestUser.keycloakId);
    if (!dbUser) {
      return jsonError(c, 404, 'User not found');
    }

    const ok = await accessService.userHasPermission(dbUser, cityId, permissionKey);
    if (!ok) {
      return jsonError(c, 403, `Forbidden: missing permission ${permissionKey}`);
    }

    await next();
  });
}

/**
 * Middleware factory : exige que l'utilisateur soit ADMIN de la `cityId`.
 * Utilisé pour CRUD des rôles et assignations (réservé aux admins de la
 * mairie ciblée).
 */
export function requireCityAdmin(cityService: CityService, userService: UserService) {
  return createMiddleware(async (c, next) => {
    const cityId = c.req.param('cityId');
    if (!cityId) {
      return jsonError(c, 400, 'Missing cityId in route params');
    }

    const requestUser = c.var.user;
    if (!requestUser) {
      return jsonError(c, 401, 'Unauthorized: No user information found');
    }

    const dbUser = await userService.getByKeycloakId(requestUser.keycloakId);
    if (!dbUser) {
      return jsonError(c, 404, 'User not found');
    }

    if (dbUser.role !== 'ADMIN') {
      return jsonError(c, 403, 'Forbidden: ADMIN role required');
    }
    const managedCityId = await cityService.getScopedCityForAdminOrEmployee(dbUser.id);
    if (managedCityId !== cityId) {
      return jsonError(c, 403, 'Forbidden: not admin of this city');
    }

    await next();
  });
}
