import type { Context } from 'node:vm';
import { Hono } from 'hono';

import type { UserService } from '../../../modules/users/user.service';

export class UserController {
  constructor(private service: UserService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/all', (c: Context) => c.json(this.service.getAll()));
    app.get('/t/:id', (c: Context) => this.getUser(c));
    app.get('/me', (c: Context) => this.getUserFromHeaders(c));

    return app;
  }

  private getUser(c: Context) {
    const user = this.service.getById(c.req.param('id'));
    return user ? c.json(user) : c.json({ error: 'User not found' }, 404);
  }

  private getUserFromHeaders(c: Context) {
    const userId = c.req.header('X-User-Id')
    const userRolesStr = c.req.header('X-User-Roles') || ''
    const userRoles = userRolesStr.split(',').filter(Boolean)
    
    if (userId) {
      console.log(`User ID from header: ${userId}`)
      console.log(`User Roles from header: ${userRoles.join(', ')}`)
      return c.json({ id: userId, roles: userRoles })
    }
    console.warn('No user information found in headers')
    return c.json({ error: 'No user information found in headers' }, 400)
  }
}
