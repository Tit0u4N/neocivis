import { Hono } from 'hono';
import { optionalEnv } from '@/infrastructure/env';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import {
  CosmosArticleRepository,
  InMemoryArticleRepository,
  isCosmosConfigured,
} from '@/modules/article/article.repository';
import { ArticleService } from '@/modules/article/article.service';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductService } from '@/modules/product/product.service';
import { AzureBlobUploadService, StubUploadService } from '@/modules/upload/upload.service';
import { UserRepository } from '@/modules/users/user.repository';
import { UserService } from '@/modules/users/user.service';
import { ArticleController } from './controllers/article.controller';
import { ProductController } from './controllers/product.controller';
import { UploadController } from './controllers/upload.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = new UserRepository();
const productRepository = new ProductRepository();
const articleRepository = isCosmosConfigured() ? new CosmosArticleRepository() : new InMemoryArticleRepository();

// Import controllers
const userController = new UserController(new UserService(userRepository));
const productController = new ProductController(new ProductService(productRepository));
const articleController = new ArticleController(new ArticleService(articleRepository));
const uploadService = optionalEnv('AZURE_STORAGE_CONNECTION_STRING')
  ? new AzureBlobUploadService()
  : new StubUploadService();
const uploadController = new UploadController(uploadService);

const app = new Hono().basePath('/api/municipality');

applyCorsMiddleware(app);
applyMockApimMiddleware(app);
applyUserMiddleware(app);
applyRoleMiddleware(app, ['EMPLOYEE']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/product', productController.getRoutes());
app.route('/articles', articleController.getRoutes());
app.route('/uploads', uploadController.getRoutes());

export default app;
