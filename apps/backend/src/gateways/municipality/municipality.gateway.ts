import type { PermissionKey } from '@repo/contracts';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import {
  createAccessRepository,
  createArticleRepository,
  createCityRepository,
  createConfigRepository,
  createEstablishmentRepository,
  createMediaRepository,
  createReportRepository,
  createThreadRepository,
  createUserRepository,
} from '@/core/in-memory-repositories';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCityAccessMiddleware } from '@/middlewares/city-access.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { requirePermission } from '@/middlewares/permission.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { AccessService } from '@/modules/access/access.service';
import { ArticleService } from '@/modules/article/service/article.service';
import { CityService } from '@/modules/city/city.service';
import { ConfigService } from '@/modules/config/service/config.service';
import { EstablishmentService } from '@/modules/establishment/service/establishment.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureMediaBlobService, PicsumMediaBlobService } from '@/modules/media/media-blob.service';
import { MediaService } from '@/modules/media/service/media.service';
import { MediaLinkService } from '@/modules/media/service/media-link.service';
import { ReportService } from '@/modules/report/service/report.service';
import { ThreadService } from '@/modules/thread/service/thread.service';
import { UserService } from '@/modules/users/service/user.service';
import { AccessController } from './controllers/access.controller';
import { ArticleController } from './controllers/article.controller';
import { CityController } from './controllers/city.controller';
import { MunicipalityConfigController } from './controllers/config.controller';
import { EstablishmentController } from './controllers/establishment.controller';
import { MediaController } from './controllers/media.controller';
import { ReportController } from './controllers/report.controller';
import { ThreadController } from './controllers/thread.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = createUserRepository();
const articleRepository = createArticleRepository();
const cityRepository = createCityRepository();
const accessRepository = createAccessRepository();
const configRepository = createConfigRepository();
const mediaBlobService = isInMemoryMode() ? new PicsumMediaBlobService() : new AzureMediaBlobService();
const establishmentRepository = createEstablishmentRepository();
const mediaRepository = createMediaRepository();
const reportRepository = createReportRepository();
const threadRepository = createThreadRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService, mediaBlobService);
const mediaLinkService = new MediaLinkService(mediaRepository);
const articleService = new ArticleService(articleRepository, mediaLinkService);
const cityService = new CityService(cityRepository, userService, iamService);
const accessService = new AccessService(accessRepository, cityService, userService);
const configService = new ConfigService(configRepository, mediaRepository);
const mediaService = new MediaService(mediaRepository, mediaBlobService);
const establishmentService = new EstablishmentService(establishmentRepository, mediaLinkService);
const reportService = new ReportService(reportRepository);
const threadService = new ThreadService(threadRepository);

// Import controllers
const userController = new UserController(userService, cityService, accessService);
const articleController = new ArticleController(articleService);
const establishmentController = new EstablishmentController(establishmentService);
const municipalityConfigController = new MunicipalityConfigController(configService);
const mediaController = new MediaController(mediaService);
const reportController = new ReportController(reportService);
const threadController = new ThreadController(threadService);
const cityController = new CityController(cityService, userService);
const accessController = new AccessController(accessService, cityService, userService);

const app = new Hono().basePath('/api/municipality');

applyCorsMiddleware(app);
applyDbMiddleware(app);
applyMockApimMiddleware(app);
applyUserMiddleware(app, userService);
applyRoleMiddleware(app, ['EMPLOYEE', 'ADMIN']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/permissions', accessController.getCatalogRoutes());

// Permission gate for PATCH /cities/:cityId — DOIT être déclaré AVANT
// `app.route('/cities', cityController.getRoutes())` pour s'appliquer.
app.use(
  '/cities/:cityId',
  createMiddleware(async (c, next) => {
    if (c.req.method !== 'PATCH') {
      await next();
      return;
    }
    return requirePermission('PAGE_CITY_HALL_MODIFY_PERMISSION', accessService, userService)(c, next);
  }),
);
app.route('/cities', cityController.getRoutes());

// City-scoped routes (new) — keep old routes temporarily.
const cityScoped = new Hono();
applyCityAccessMiddleware(cityScoped, 'staff', cityService, userService);

// Permission gates for city-scoped article routes (registered BEFORE the
// protected router). Méthodes -> permission requise.
const articleMethodToPermission = new Map<string, PermissionKey>([
  ['POST', 'ARTICLE_PUBLISH_PERMISSION'],
  ['PUT', 'ARTICLE_MODIFY_PERMISSION'],
  ['PATCH', 'ARTICLE_MODIFY_PERMISSION'],
  ['DELETE', 'ARTICLE_DELETE_PERMISSION'],
]);
const articlePermissionGate = createMiddleware(async (c, next) => {
  const perm = articleMethodToPermission.get(c.req.method);
  if (!perm) {
    await next();
    return;
  }
  return requirePermission(perm, accessService, userService)(c, next);
});
const establishmentMethodToPermission = new Map<string, PermissionKey>([
  ['POST', 'ESTABLISHMENT_CREATE_PERMISSION'],
  ['PUT', 'ESTABLISHMENT_MODIFY_PERMISSION'],
  ['PATCH', 'ESTABLISHMENT_MODIFY_PERMISSION'],
  ['DELETE', 'ESTABLISHMENT_DELETE_PERMISSION'],
]);
const establishmentPermissionGate = createMiddleware(async (c, next) => {
  const perm = establishmentMethodToPermission.get(c.req.method);
  if (!perm) {
    await next();
    return;
  }
  return requirePermission(perm, accessService, userService)(c, next);
});
const reportMethodToPermission = new Map<string, PermissionKey>([
  ['GET', 'SIGNAL_VIEW_PERMISSION'],
  ['PATCH', 'SIGNAL_MODIFY_PERMISSION'],
]);
const reportPermissionGate = createMiddleware(async (c, next) => {
  const perm = reportMethodToPermission.get(c.req.method);
  if (!perm) {
    await next();
    return;
  }
  return requirePermission(perm, accessService, userService)(c, next);
});
// Forum thread permission gate:
// GET requests are open (staff members can always read threads).
// Mute/unmute are gated under FORUM_THREAD_MODIFY_PERMISSION (no dedicated mute key exists).
// Reactions (POST/DELETE .../reactions) are gated under CREATE (participation, not moderation).
// Archive/unarchive are gated under MODIFY.
const threadPermissionGate = createMiddleware(async (c, next) => {
  const method = c.req.method;
  const path = c.req.path;

  if (method === 'GET') {
    await next();
    return;
  }

  let perm: PermissionKey | undefined;

  if (path.includes('/moderation/users/')) {
    if (path.endsWith('/ban')) {
      perm = 'FORUM_THREAD_BAN_USER_PERMISSION';
    } else if (path.endsWith('/unban')) {
      perm = 'FORUM_THREAD_UNBAN_USER_PERMISSION';
    } else {
      // mute / unmute
      perm = 'FORUM_THREAD_MODIFY_PERMISSION';
    }
  } else if (path.includes('/reactions')) {
    // POST add reaction, DELETE remove reaction — both treated as participation
    perm = 'FORUM_THREAD_CREATE_PERMISSION';
  } else if (path.endsWith('/archive') || path.endsWith('/unarchive')) {
    perm = 'FORUM_THREAD_MODIFY_PERMISSION';
  } else if (path.includes('/messages/') && path.endsWith('/restore')) {
    perm = 'FORUM_THREAD_DELETE_MESSAGE_PERMISSION';
  } else if (path.includes('/messages/') && method === 'DELETE') {
    perm = 'FORUM_THREAD_DELETE_MESSAGE_PERMISSION';
  } else if (path.includes('/messages')) {
    perm = 'FORUM_THREAD_CREATE_PERMISSION';
  } else if (path.endsWith('/restore')) {
    perm = 'FORUM_THREAD_DELETE_PERMISSION';
  } else if (method === 'DELETE') {
    perm = 'FORUM_THREAD_DELETE_PERMISSION';
  } else if (method === 'PUT') {
    perm = 'FORUM_THREAD_MODIFY_PERMISSION';
  } else if (method === 'POST') {
    perm = 'FORUM_THREAD_CREATE_PERMISSION';
  }

  if (!perm) {
    await next();
    return;
  }
  return requirePermission(perm, accessService, userService)(c, next);
});

cityScoped.use('/threads', threadPermissionGate);
cityScoped.use('/threads/*', threadPermissionGate);
cityScoped.use('/articles', articlePermissionGate);
cityScoped.use('/articles/*', articlePermissionGate);
cityScoped.use('/establishment', establishmentPermissionGate);
cityScoped.use('/establishment/*', establishmentPermissionGate);
cityScoped.use('/reports', reportPermissionGate);
cityScoped.use('/reports/*', reportPermissionGate);

cityScoped.route('/threads', threadController.getRoutes());
cityScoped.route('/articles', articleController.getRoutes());
cityScoped.route('/establishment', establishmentController.getRoutes());
cityScoped.route('/reports', reportController.getRoutes());
cityScoped.route('/media', mediaController.getRoutes());

cityScoped.route('/config', municipalityConfigController.getRoutes());

// Routes ADMIN-only (CRUD roles + assignations) sous /cities/:cityId.
cityScoped.route('/', accessController.getCityScopedRoutes());

app.route('/cities/:cityId', cityScoped);

export default app;
