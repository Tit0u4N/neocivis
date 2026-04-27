import { Hono } from 'hono';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { KeycloakIAMService } from '@/infrastructure/iam/keycloak-iam.service';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { CosmosArticleRepository, InMemoryArticleRepository } from '@/modules/article/article.repository';
import { ArticleService } from '@/modules/article/article.service';
import { DrizzleUserRepository } from '@/modules/users/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/user.inmemory.repository';
import { UserService } from '@/modules/users/user.service';
import { ArticleController } from './controllers/article.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();

// Import services
const userService = new UserService(userRepository);
const iamService = new KeycloakIAMService();

// Import controllers
const userController = new UserController(new UserService(userRepository));
const articleController = new ArticleController(new ArticleService(articleRepository));

let app = new Hono().basePath('/api/citizen');

app = applyCorsMiddleware(app);
app = applyDbMiddleware(app);
app = applyMockApimMiddleware(app);
app = applyUserMiddleware(app, userService, iamService);
app = applyRoleMiddleware(app, ['CITIZEN']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/articles', articleController.getRoutes());

export default app;
