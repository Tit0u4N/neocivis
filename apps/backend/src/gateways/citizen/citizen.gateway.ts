import { Hono } from 'hono';
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
import { UserRepository } from '@/modules/users/user.repository';
import { UserService } from '@/modules/users/user.service';
import { ArticleController } from './controllers/article.controller';
import { ProductController } from './controllers/product.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = new UserRepository();
const productRepository = new ProductRepository();
const articleRepository = isCosmosConfigured() ? new CosmosArticleRepository() : new InMemoryArticleRepository();

// Import controllers
const userController = new UserController(new UserService(userRepository));
const productController = new ProductController(new ProductService(productRepository));
const articleController = new ArticleController(new ArticleService(articleRepository));

let app = new Hono().basePath('/api/citizen');

app = applyCorsMiddleware(app);
app = applyMockApimMiddleware(app);
app = applyUserMiddleware(app);
app = applyRoleMiddleware(app, ['citizen']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/product', productController.getRoutes());
app.route('/articles', articleController.getRoutes());

export default app;
