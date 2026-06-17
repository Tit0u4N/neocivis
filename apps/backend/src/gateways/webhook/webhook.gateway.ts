import { Hono } from 'hono';
import { createUserRepository } from '@/core/in-memory-repositories';
import { applyDbMiddleware } from '@/infrastructure/db/db.middleware';
import { applyCorsMiddleware } from '@/middlewares/cors.middleware';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { UserService } from '@/modules/users/service/user.service';
import { WebhookService } from '@/modules/webhook/webhook.service';
import { WebhookController } from './controllers/webhook.controller';

const userRepository = createUserRepository();
const iamService = new KeycloakIAMService();
const userService = new UserService(userRepository, iamService);
const webhookService = new WebhookService(userService);
const webhookController = new WebhookController(webhookService);

const app = new Hono();
const webhookRoutes = webhookController.getRoutes();

applyCorsMiddleware(app);
applyDbMiddleware(app);
// APIM (déploiement) : /webhook/post — Azure Functions local : /api/webhook/post
app.route('/api-webhook/webhook', webhookRoutes);
app.route('/api/webhook', webhookRoutes);

export default app;
