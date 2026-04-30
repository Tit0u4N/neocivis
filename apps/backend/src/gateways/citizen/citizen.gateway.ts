import { Hono } from 'hono';
import { startAutoSeedOnStartup } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { CosmosArticleRepository, InMemoryArticleRepository } from '@/modules/article/article.repository';
import { ArticleService } from '@/modules/article/article.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/user.service';
import { ArticleController } from './controllers/article.controller';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();

// Import services
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const articleService = new ArticleService(articleRepository);

startAutoSeedOnStartup({ userService, articleRepository });

// Import controllers
const userController = new UserController(userService);
const articleController = new ArticleController(articleService);

let app = new Hono().basePath('/api/citizen');

app = applyCorsMiddleware(app);
app = applyDbMiddleware(app);
app = applyMockApimMiddleware(app);
app = applyUserMiddleware(app, userService);
app = applyRoleMiddleware(app, ['CITIZEN']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/articles', articleController.getRoutes());

export default app;
