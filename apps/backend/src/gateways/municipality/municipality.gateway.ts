import { Hono } from 'hono';
import { startAutoSeedOnStartup } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { InMemoryArticleRepository } from '@/modules/article/repository/article.inmemory.repository';
import { ArticleService } from '@/modules/article/service/article.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureBlobUploadService, StubUploadService } from '@/modules/upload/upload.service';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/service/user.service';
import { ArticleController } from './controllers/article.controller';
import { UploadController } from './controllers/upload.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const articleService = new ArticleService(articleRepository);
const uploadService = isInMemoryMode() ? new AzureBlobUploadService() : new StubUploadService();

await startAutoSeedOnStartup({ userService, articleRepository });

// Import controllers
const userController = new UserController(userService);
const articleController = new ArticleController(articleService);
const uploadController = new UploadController(uploadService);

const app = new Hono().basePath('/api/municipality');

applyCorsMiddleware(app);
applyDbMiddleware(app);
applyMockApimMiddleware(app);
applyUserMiddleware(app, userService);
applyRoleMiddleware(app, ['EMPLOYEE']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/articles', articleController.getRoutes());
app.route('/uploads', uploadController.getRoutes());

export default app;
