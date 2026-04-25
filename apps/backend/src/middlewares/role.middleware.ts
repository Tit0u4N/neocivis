import { createInsufficientRoleError, type InsufficientRoleErrorMessage } from '@repo/contracts/error-messages';

const checkRoleGateway = (requiredRoles: string[]) => {
  // biome-ignore lint/suspicious/useAwait: On s'en fou c'est du test
  return async (c: any, next: any) => {
    const user = c.user;
    if (!user) {
      return c.json({ error: 'Unauthorized: No user information found' }, 401);
    }
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      const error = createInsufficientRoleError(requiredRoles, user.roles) as InsufficientRoleErrorMessage;
      return c.json(error, 403);
    }
    return next();
  };
};

export function applyRoleMiddleware(app: any, requiredRoles: string[]) {
  app.use('*', checkRoleGateway(requiredRoles));
  return app;
}
