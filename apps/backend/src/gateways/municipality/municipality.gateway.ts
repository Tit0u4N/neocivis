import { Hono } from 'hono';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { optionalEnv } from '@/infrastructure/env';
import { KeycloakIAMService } from '@/infrastructure/iam/keycloak-iam.service';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { CosmosArticleRepository, InMemoryArticleRepository } from '@/modules/article/article.repository';
import { ArticleService } from '@/modules/article/article.service';
import { AzureBlobUploadService, StubUploadService } from '@/modules/upload/upload.service';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/user.service';
import { ArticleController } from './controllers/article.controller';
import { UploadController } from './controllers/upload.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();

// Import services
const userService = new UserService(userRepository);
const iamService = new KeycloakIAMService();
const uploadService = optionalEnv('AZURE_STORAGE_CONNECTION_STRING')
  ? new AzureBlobUploadService()
  : new StubUploadService();

// Import controllers
const userController = new UserController(userService);
const articleController = new ArticleController(new ArticleService(articleRepository));
const uploadController = new UploadController(uploadService);

const app = new Hono().basePath('/api/municipality');

applyCorsMiddleware(app);
applyDbMiddleware(app);
applyMockApimMiddleware(app);
applyUserMiddleware(app, userService, iamService);
applyRoleMiddleware(app, ['EMPLOYEE']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/articles', articleController.getRoutes());
app.route('/uploads', uploadController.getRoutes());

export default app;
