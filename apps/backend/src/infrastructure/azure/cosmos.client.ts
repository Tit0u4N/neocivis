import { CosmosClient } from '@azure/cosmos';
import { requiredEnv } from '../env';

let singleton: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
  if (singleton) {
    return singleton;
  }

  const endpoint = requiredEnv('COSMOS_ENDPOINT');
  const key = requiredEnv('COSMOS_KEY');

  singleton = new CosmosClient({
    endpoint,
    key,
    // TODO : Enable endpoint discovery when in prod
    connectionPolicy: {
      enableEndpointDiscovery: false,
    },
  });
  return singleton;
}
