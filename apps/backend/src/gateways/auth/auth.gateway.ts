import { Hono } from 'hono';
import { UserRepository } from '../../modules/users/user.repository';
import { UserService } from '../../modules/users/user.service';
import { UserController } from './controllers/user.controller';

// Import repositories
const userRepository = new UserRepository();

// Import controllers
const userController = new UserController(new UserService(userRepository));

const app = new Hono().basePath('/api/auth');

// Register routes from controllers
app.route('/user/', userController.getRoutes());

export default app;
