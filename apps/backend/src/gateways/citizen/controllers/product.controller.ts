import type { Context } from 'hono';
import { Hono } from 'hono';

import type { ProductService } from '@/modules/product/product.service';

export class ProductController {
  constructor(private service: ProductService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/all', (c: Context) => {
      return c.json(this.service.list());
    });

    app.get('/*', (c: Context) => {
      const request = {
        url: c.req.url,
        method: c.req.method,
        headers: c.req.header(),
        query: c.req.query(),
        path: c.req.path,
        params: c.req.param(),
      };
      return c.json(request);
    });

    return app;
  }
}
