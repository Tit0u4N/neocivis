import { app } from '@azure/functions';
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter';
import authGateway from './gateways/auth/auth.gateway';
import citizenGateway from './gateways/citizen/citizen.gateway';
import municipalityGateway from './gateways/municipality/municipality.gateway';

// --- Fonction 1 : Module Citizen ---
app.http('citizenModule', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'function',
  route: 'citizen/{*proxy}',
  handler: azureHonoHandler(citizenGateway.fetch),
});

// --- Fonction 2 : Module Municipality ---
app.http('municipalityModule', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'function',
  route: 'municipality/{*proxy}',
  handler: azureHonoHandler(municipalityGateway.fetch),
});

// --- Fonction 3 : Module Auth ---
app.http('authModule', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'function',
  route: 'auth/{*proxy}',
  handler: azureHonoHandler(authGateway.fetch),
});
