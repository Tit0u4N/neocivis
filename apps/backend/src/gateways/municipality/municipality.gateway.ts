import { Hono } from 'hono';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { optionalEnv } from '@/infrastructure/env';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import {
  CosmosArticleRepository,
  InMemoryArticleRepository,
} from '@/modules/article/article.repository';
import { ArticleService } from '@/modules/article/article.service';
import { isInMemoryMode } from '@/core/runtime-config';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductService } from '@/modules/product/product.service';
import { AzureBlobUploadService, StubUploadService } from '@/modules/upload/upload.service';
import { DrizzleUserRepository } from '@/modules/users/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/user.inmemory.repository';
import { UserService } from '@/modules/users/user.service';
import { ArticleController } from './controllers/article.controller';
import { ProductController } from './controllers/product.controller';
import { UploadController } from './controllers/upload.controller';
import { UserController } from './controllers/user.controller';
import { KeycloakIAMService } from '@/infrastructure/iam/keycloak-iam.service';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const productRepository = new ProductRepository();
const articleRepository = isInMemoryMode()
  ? new InMemoryArticleRepository()
  : new CosmosArticleRepository();

// Import services
const userService = new UserService(userRepository);
const iamService = new KeycloakIAMService();
const uploadService = optionalEnv('AZURE_STORAGE_CONNECTION_STRING')
  ? new AzureBlobUploadService()
  : new StubUploadService();

// Import controllers
const userController = new UserController(userService);
const productController = new ProductController(new ProductService(productRepository));
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
app.route('/product', productController.getRoutes());
app.route('/articles', articleController.getRoutes());
app.route('/uploads', uploadController.getRoutes());

export default app;
