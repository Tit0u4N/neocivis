// This middleware checks if the user is in the headers and places the user info in req.user for downstream middlewares and route handlers.

import { Hono } from 'hono'

const userMiddleware = (c, next) => {
    const userId = c.req.raw.headers.get('X-User-Id')
    const userRolesStr = c.req.raw.headers.get('X-User-Roles') || ''
    const userRoles = userRolesStr.split(',').filter(Boolean)
    console.log('User Middleware: Extracted user info from headers - ID:', userId, 'Roles:', userRoles.join(', '))
    if (userId) {
        c.user = { id: userId, roles: userRoles }
    }
    return next()
}

export function applyUserMiddleware(app: Hono) {
    app.use('*', userMiddleware)
    return app
}
    