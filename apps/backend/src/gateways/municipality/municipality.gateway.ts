import { Hono } from 'hono';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductService } from '@/modules/product/product.service';
import { UserRepository } from '@/modules/users/user.repository';
import { UserService } from '@/modules/users/user.service';
import { ProductController } from './controllers/product.controller';
import { UserController } from './controllers/user.controller';
import { applyMockApimMiddleware } from '@/middlewares/local-auth.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { applyRoleMiddleware } from '@/middlewares/role.middleware';
import { applyUserMiddleware } from '@/middlewares/auth.middleware';


// Import repositories
const userRepository = new UserRepository();
const productRepository = new ProductRepository();

// Import controllers
const userController = new UserController(new UserService(userRepository));
const productController = new ProductController(new ProductService(productRepository));
    

const app = new Hono().basePath('/api/municipality');

applyCorsMiddleware(app);
applyMockApimMiddleware(app);
applyUserMiddleware(app);
applyRoleMiddleware(app, ['EMPLOYEE']);

// Register routes from controllers
app.route('/user', userController.getRoutes());
app.route('/product', productController.getRoutes());

export default app;
