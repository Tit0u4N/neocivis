import { Hono } from 'hono';
import {
  createAccessRepository,
  createArticleRepository,
  createCityRepository,
  createConfigRepository,
  createEstablishmentRepository,
  createReportRepository,
  createUserRepository,
} from '@/core/in-memory-repositories';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCityAccessMiddleware } from '@/middlewares/city-access.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { AccessService } from '@/modules/access/access.service';
import { ArticleService } from '@/modules/article/service/article.service';
import { CityService } from '@/modules/city/city.service';
import { ConfigService } from '@/modules/config/service/config.service';
import { EstablishmentService } from '@/modules/establishment/service/establishment.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureMediaBlobService, PicsumMediaBlobService } from '@/modules/media/media-blob.service';
import { ReportService } from '@/modules/report/service/report.service';
import { AzureBlobUploadService } from '@/modules/upload/upload.service';
import { UserService } from '@/modules/users/service/user.service';
import { ArticleController } from './controllers/article.controller';
import { CityController } from './controllers/city.controller';
import { ConfigController } from './controllers/config.controller';
import { EstablishmentController } from './controllers/establishment.controller';
import { ReportController } from './controllers/report.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = createUserRepository();
const articleRepository = createArticleRepository();
const cityRepository = createCityRepository();
const accessRepository = createAccessRepository();
const configRepository = createConfigRepository();
const establishmentRepository = createEstablishmentRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const articleService = new ArticleService(articleRepository);
const cityService = new CityService(cityRepository, userService, iamService);
const accessService = new AccessService(accessRepository, cityService, userService);
const reportRepository = createReportRepository();
const mediaBlobService = isInMemoryMode() ? new PicsumMediaBlobService() : new AzureMediaBlobService();
const uploadService = new AzureBlobUploadService(mediaBlobService);
const establishmentService = new EstablishmentService(establishmentRepository);

// Import controllers
const userController = new UserController(userService, cityService, accessService);
const articleController = new ArticleController(articleService);
const reportController = new ReportController(new ReportService(reportRepository), uploadService);
const configController = new ConfigController(new ConfigService(configRepository));
const establishmentController = new EstablishmentController(establishmentService);
const cityController = new CityController(cityService, userService);

let app = new Hono().basePath('/api/citizen');

app = applyCorsMiddleware(app);
app = applyDbMiddleware(app);
app = applyMockApimMiddleware(app);
app = applyUserMiddleware(app, userService);
app = applyRoleMiddleware(app, ['CITIZEN', 'ADMIN', 'EMPLOYEE']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/cities', cityController.getRoutes());
app.route('/articles', articleController.getRoutes());
app.route('/establishment', establishmentController.getRoutes());
app.route('/reports', reportController.getRoutes());
app.route('/config', configController.getRoutes());

// City-scoped routes (new) — keep old routes temporarily.
const cityScoped = new Hono();
applyCityAccessMiddleware(cityScoped, 'citizen', cityService, userService);
cityScoped.route('/articles', articleController.getRoutes());
cityScoped.route('/establishment', establishmentController.getRoutes());
cityScoped.route('/reports', reportController.getRoutes());
cityScoped.route('/config', configController.getRoutes());
app.route('/cities/:cityId', cityScoped);

export default app;
