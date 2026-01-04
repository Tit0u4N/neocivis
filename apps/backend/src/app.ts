import { Hono } from 'hono';
import { ProductController } from './modules/product/product.controller';
import { UserController } from './modules/user/user.controller';

const app = new Hono();

app.route('/', new UserController().routes());
app.route('/', new ProductController().routes());

export default app;
