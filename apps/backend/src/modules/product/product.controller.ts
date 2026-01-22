import type { Context } from 'node:vm';
import { Hono } from 'hono';

import { ProductService } from './product.service';

export class ProductController {
  constructor(private service = new ProductService()) {}

  routes() {
    const app = new Hono().basePath('/products');

    app.get('/', (c: Context) => {
      return c.json(this.service.list());
    });

    app.get('/*', (c: Context) => {
      const request = {
        url: c.req.url,
        method: c.req.method,
        headers: c.req.headers,
        query: c.req.query(),
        path: c.req.path,
        params: c.req.param(),
      };
      return c.json(request);
    });
    return app;
  }
}
