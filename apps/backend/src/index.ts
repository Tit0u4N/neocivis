import { app } from '@azure/functions';
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter';
import { assertBackendEnv } from './core/env-check';
import './core/seed-bootstrap';
import citizenGateway from './gateways/citizen/citizen.gateway';
import municipalityGateway from './gateways/municipality/municipality.gateway';
import webhookGateway from './gateways/webhook/webhook.gateway';

assertBackendEnv();

// --- Fonction 1 : Module Citizen ---
app.http('citizenModule', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  authLevel: 'function',
  route: 'citizen/{*proxy}',
  handler: azureHonoHandler(citizenGateway.fetch),
});

// --- Fonction 2 : Module Municipality ---
app.http('municipalityModule', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  authLevel: 'function',
  route: 'municipality/{*proxy}',
  handler: azureHonoHandler(municipalityGateway.fetch),
});

// --- Fonction 3 : Webhook Keycloak (pas d'auth applicative) ---
app.http('webhookModule', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'webhook/{*proxy}',
  handler: azureHonoHandler(webhookGateway.fetch),
});
