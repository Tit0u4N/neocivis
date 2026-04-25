import { Hono } from 'hono';
import { ProductController } from './modules/product/product.controller';
import { UserController } from './modules/user/user.controller';
import { authMiddleware} from "./shared/auth.middleware";

const app = new Hono();

app.use('*', authMiddleware);

app.route('/', new UserController().routes());
app.route('/', new ProductController().routes());

export default app;
