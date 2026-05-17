import { Hono } from 'hono';
import { startAutoSeedOnStartup } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCityAccessMiddleware } from '@/middlewares/city-access.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
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
import { InMemoryReportRepository } from '@/modules/report/report.repository';
import { ReportService } from '@/modules/report/report.service';
import { StubUploadService } from '@/modules/upload/upload.service';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/service/user.service';
import { ArticleController } from './controllers/article.controller';
import { CityController } from './controllers/city.controller';
import { ConfigController } from './controllers/config.controller';
import { ReportController } from './controllers/report.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();
const cityRepository = isInMemoryMode() ? new InMemoryCityRepository() : new DrizzleCityRepository();
const accessRepository = isInMemoryMode() ? new InMemoryAccessRepository() : new DrizzleAccessRepository();
const configRepository = new InMemoryConfigRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const articleService = new ArticleService(articleRepository);
const cityService = new CityService(cityRepository, userService, iamService);
const accessService = new AccessService(accessRepository, cityService, userService);
const reportRepository = new InMemoryReportRepository();

await startAutoSeedOnStartup({ userService, articleRepository, cityRepository, iamService, accessService });

// Import controllers
const userController = new UserController(userService, cityService, accessService);
const articleController = new ArticleController(articleService);
const reportController = new ReportController(new ReportService(reportRepository), new StubUploadService());
const configController = new ConfigController(new ConfigService(configRepository));
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
app.route('/reports', reportController.getRoutes());
app.route('/config', configController.getRoutes());

// City-scoped routes (new) — keep old routes temporarily.
const cityScoped = new Hono();
applyCityAccessMiddleware(cityScoped, 'citizen', cityService, userService);
cityScoped.route('/articles', articleController.getRoutes());
cityScoped.route('/reports', reportController.getRoutes());
cityScoped.route('/config', configController.getRoutes());
app.route('/cities/:cityId', cityScoped);

export default app;
