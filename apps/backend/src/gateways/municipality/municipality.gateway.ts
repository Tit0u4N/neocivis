import { Hono } from 'hono';
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
import { PermissionGuard } from '@/middlewares/permission.guard';
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

const permissionGuard = new PermissionGuard(accessService, userService, cityService);

// Import controllers
const userController = new UserController(userService, cityService, accessService);
const articleController = new ArticleController(articleService, permissionGuard);
const establishmentController = new EstablishmentController(establishmentService, permissionGuard);
const municipalityConfigController = new MunicipalityConfigController(configService, permissionGuard);
const mediaController = new MediaController(mediaService, permissionGuard);
const reportController = new ReportController(reportService, permissionGuard);
const threadController = new ThreadController(threadService, permissionGuard);
const cityController = new CityController(cityService, userService, permissionGuard);
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
app.route('/cities', cityController.getRoutes());

// City-scoped routes
const cityScoped = new Hono();
applyCityAccessMiddleware(cityScoped, 'staff', cityService, userService);

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
