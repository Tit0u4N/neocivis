import { Hono } from 'hono';
import { startAutoSeedOnStartup } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { applyCityAccessMiddleware } from '@/middlewares/city-access.middleware';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { InMemoryArticleRepository } from '@/modules/article/repository/article.inmemory.repository';
import { ArticleService } from '@/modules/article/service/article.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureBlobUploadService, StubUploadService } from '@/modules/upload/upload.service';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/service/user.service';
import { ArticleController } from './controllers/article.controller';
import { CityController } from './controllers/city.controller';
import { UploadController } from './controllers/upload.controller';
import { UserController } from './controllers/user.controller';
import { CityService } from '@/modules/city/city.service';
import { DrizzleCityRepository } from '@/modules/city/repository/city.drizzle.repository';
import { InMemoryCityRepository } from '@/modules/city/repository/city.inmemory.repository';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();
const cityRepository = isInMemoryMode() ? new InMemoryCityRepository() : new DrizzleCityRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const articleService = new ArticleService(articleRepository);
const cityService = new CityService(cityRepository, userService, iamService);
const uploadService = isInMemoryMode() ? new AzureBlobUploadService() : new StubUploadService();

await startAutoSeedOnStartup({ userService, articleRepository, cityRepository, iamService });

// Import controllers
const userController = new UserController(userService, cityService);
const articleController = new ArticleController(articleService);
const uploadController = new UploadController(uploadService);
const cityController = new CityController(cityService, userService);

const app = new Hono().basePath('/api/municipality');

applyCorsMiddleware(app);
applyDbMiddleware(app);
applyMockApimMiddleware(app);
applyUserMiddleware(app, userService);
applyRoleMiddleware(app, ['EMPLOYEE', 'ADMIN']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/cities', cityController.getRoutes());
app.route('/articles', articleController.getRoutes());
app.route('/uploads', uploadController.getRoutes());

// City-scoped routes (new) — keep old routes temporarily.
const cityScoped = new Hono();
applyCityAccessMiddleware(cityScoped, 'staff', cityService, userService);
cityScoped.route('/articles', articleController.getRoutes());
cityScoped.route('/uploads', uploadController.getRoutes());
app.route('/cities/:cityId', cityScoped);

export default app;
