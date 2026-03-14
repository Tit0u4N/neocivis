import { app } from '@azure/functions';
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter';
import citizenGateway from './gateways/citizen/citizen.gateway';
import municipalityGateway from './gateways/municipality/municipality.gateway';

// --- Fonction 1 : Module Citizen ---
app.http('citizenModule', {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  authLevel: 'function',
  route: 'citizen/{*proxy}',
  handler: azureHonoHandler(citizenGateway.fetch),
});

// --- Fonction 2 : Module Municipality ---
app.http('municipalityModule', {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  authLevel: 'function',
  route: 'municipality/{*proxy}',
  handler: azureHonoHandler(municipalityGateway.fetch),
});