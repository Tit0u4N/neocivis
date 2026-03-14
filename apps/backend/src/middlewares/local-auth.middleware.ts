import { Hono } from "hono"

const mockApimMiddleware = async (c, next) => {
  // En production, ce bloc n'existerait pas dans Hono. 
  // APIM ferait ce travail en amont.
  
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Gateway Mock: Unauthorized' }, 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    // 1. On simule la lecture du token par APIM
    const payloadBase64 = token.split('.')[1]
    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
    
    // 2. APIM injecte les infos dans les headers pour Hono
    // Note : Dans Hono, on modifie les headers de la requête entrante 
    // pour que les routes suivantes croient qu'ils ont été envoyés par APIM.
    c.req.raw.headers.set('X-User-Id', decodedPayload.sub)
    
    // Si Keycloak envoie les rôles sous "realm_access.roles"
    const roles = decodedPayload.realm_access?.roles || []
    c.req.raw.headers.set('X-User-Roles', roles.join(','))

    await next()
  } catch (error) {
    return c.json({ error: 'Gateway Mock: Invalid Token' }, 401)
  }
}

export function applyMockApimMiddleware(app: Hono) {
    // Si le mode est "development", on applique le middleware de mock APIM
    if (process.env.ENV_MODE === 'development') {
        console.log('DEV MODE: Applying Mock APIM Middleware for development environment')
        console.log('ATTENTION: If you are seeing this in production, please check your ENV_MODE configuration!')
        app.use('*', mockApimMiddleware)
    }
    return app
}