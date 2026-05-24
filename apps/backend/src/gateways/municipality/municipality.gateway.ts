import type { PermissionKey } from '@repo/contracts';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCityAccessMiddleware } from '@/middlewares/city-access.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { requirePermission } from '@/middlewares/permission.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { AccessService } from '@/modules/access/access.service';
import { DrizzleAccessRepository } from '@/modules/access/repository/access.drizzle.repository';
import { InMemoryAccessRepository } from '@/modules/access/repository/access.inmemory.repository';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { InMemoryArticleRepository } from '@/modules/article/repository/article.inmemory.repository';
import { ArticleService } from '@/modules/article/service/article.service';
import { CityService } from '@/modules/city/city.service';
import { DrizzleCityRepository } from '@/modules/city/repository/city.drizzle.repository';
import { InMemoryCityRepository } from '@/modules/city/repository/city.inmemory.repository';
import { InMemoryConfigRepository } from '@/modules/config/repository/config.inmemory.repository';
import { ConfigService } from '@/modules/config/service/config.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureMediaBlobService, PicsumMediaBlobService } from '@/modules/media/media-blob.service';
import { CosmosMediaRepository } from '@/modules/media/repository/media.cosmos.repository';
import { InMemoryMediaRepository } from '@/modules/media/repository/media.inmemory.repository';
import { MediaService } from '@/modules/media/service/media.service';
import { MediaLinkService } from '@/modules/media/service/media-link.service';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/service/user.service';
import { AccessController } from './controllers/access.controller';
import { ArticleController } from './controllers/article.controller';
import { CityController } from './controllers/city.controller';
import { MunicipalityConfigController } from './controllers/config.controller';
import { MediaController } from './controllers/media.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();
const cityRepository = isInMemoryMode() ? new InMemoryCityRepository() : new DrizzleCityRepository();
const accessRepository = isInMemoryMode() ? new InMemoryAccessRepository() : new DrizzleAccessRepository();
const configRepository = new InMemoryConfigRepository();
const mediaBlobService = isInMemoryMode() ? new PicsumMediaBlobService() : new AzureMediaBlobService();
const mediaRepository = isInMemoryMode() ? new InMemoryMediaRepository() : new CosmosMediaRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const mediaLinkService = new MediaLinkService(mediaRepository);
const articleService = new ArticleService(articleRepository, mediaLinkService);
const cityService = new CityService(cityRepository, userService, iamService);
const accessService = new AccessService(accessRepository, cityService, userService);
const configService = new ConfigService(configRepository);
const mediaService = new MediaService(mediaRepository, mediaBlobService);

// Import controllers
const userController = new UserController(userService, cityService, accessService);
const articleController = new ArticleController(articleService);
const municipalityConfigController = new MunicipalityConfigController(configService);
const mediaController = new MediaController(mediaService);
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
app.route('/config', municipalityConfigController.getRoutes());

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
cityScoped.use('/articles', articlePermissionGate);
cityScoped.use('/articles/*', articlePermissionGate);

cityScoped.route('/articles', articleController.getRoutes());
cityScoped.route('/media', mediaController.getRoutes());

// Routes ADMIN-only (CRUD roles + assignations) sous /cities/:cityId.
cityScoped.route('/', accessController.getCityScopedRoutes());

app.route('/cities/:cityId', cityScoped);

export default app;
