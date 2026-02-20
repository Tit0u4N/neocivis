import type { Context } from 'node:vm';
import { Hono } from 'hono';

import type { UserService } from '../../../modules/users/user.service';

export class UserController {
  constructor(private service: UserService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/', (c: Context) => c.json(this.service.getAll()));
    app.get('/:id', (c: Context) => this.getUser(c));

    return app;
  }

  private getUser(c: Context) {
    const user = this.service.getById(c.req.param('id'));
    return user ? c.json(user) : c.json({ error: 'User not found' }, 404);
  }
}
