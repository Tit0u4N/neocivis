import type { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { UserService } from '@/modules/users/service/user.service';
import type { CityService } from '@/modules/city/city.service';

type Mode = 'citizen' | 'staff';

function unauthorizedResponse(c: any) {
  return c.json({ error: 'Unauthorized: No user information found' }, 401);
}

export function applyCityAccessMiddleware(app: Hono, mode: Mode, cityService: CityService, userService: UserService): Hono {
  app.use(
    '*',
    createMiddleware(async (c, next) => {
      const keycloakId = c.req.header('X-User-Id');
      if (!keycloakId) {
        return unauthorizedResponse(c);
      }
      const user = await userService.getByKeycloakId(keycloakId);
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      const cityId = c.req.param('cityId');
      if (!cityId) {
        return c.json({ error: 'Missing cityId in route params' }, 400);
      }

      if (mode === 'citizen') {
        if (user.role === 'CITIZEN') {
          const ok = await cityService.isCitizenMember(cityId, user.id);
          if (!ok) {
            return c.json({ error: 'Forbidden: user not in city' }, 403);
          }
          await next();
          return;
        }

        // Allow staff to access citizen gateway city-scoped routes too.
        if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') {
          const ok = await cityService.isStaffOfCity(cityId, user.id);
          if (!ok) {
            return c.json({ error: 'Forbidden: user not in city' }, 403);
          }
          await next();
          return;
        }

        return c.json({ error: 'Forbidden' }, 403);
      }

      // staff mode
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        return c.json({ error: 'Forbidden' }, 403);
      }
      const ok = await cityService.isStaffOfCity(cityId, user.id);
      if (!ok) {
        return c.json({ error: 'Forbidden: user not in city' }, 403);
      }
      await next();
    }),
  );
  return app;
}

