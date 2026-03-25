import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Middleware CORS for Hono
export function applyCorsMiddleware(app: Hono) {
    app.use('*', cors({
        origin: '*', 
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Roles'],
        exposeHeaders: ['X-User-Id', 'X-User-Roles'],
        maxAge: 86400, // Cache the preflight response for 24 hours
    }))
    
    return app
}