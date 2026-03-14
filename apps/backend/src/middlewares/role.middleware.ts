import { createInsufficientRoleError, InsufficientRoleErrorMessage } from '@repo/dto';

const checkRoleGateway = (requiredRoles: string[]) => {
    return async (c: any, next: any) => {
        const user = c.user
        if (!user) {
            return c.json({ error: 'Unauthorized: No user information found' }, 401)
        }
        const hasRole = requiredRoles.some(role => user.roles.includes(role))
        if (!hasRole) {
            const error = createInsufficientRoleError(requiredRoles, user.roles) as InsufficientRoleErrorMessage
            return c.json(error, 403)
        }
        return next()
    }
}

export function applyRoleMiddleware(app: any, requiredRoles: string[]) {
    app.use('*', checkRoleGateway(requiredRoles))
    return app
}