import type { Context } from 'node:vm';
import { Hono } from 'hono';

import type { UserService } from '../../../modules/users/user.service';

export class UserController {
  constructor(private service: UserService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/', (c: Context) => c.json(this.service.getAll()));

    return app;
  }
}
