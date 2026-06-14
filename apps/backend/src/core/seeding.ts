import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import dotenv from 'dotenv';

import { runSeeders } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { AccessService } from '@/modules/access/access.service';
import { DrizzleAccessRepository } from '@/modules/access/repository/access.drizzle.repository';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { CityService } from '@/modules/city/city.service';
import { DrizzleCityRepository } from '@/modules/city/repository/city.drizzle.repository';
import { CosmosConfigRepository } from '@/modules/config/repository/config.cosmos.repository';
import { DrizzleEstablishmentRepository } from '@/modules/establishment/repository/establishment.drizzle.repository';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureMediaBlobService } from '@/modules/media/media-blob.service';
import { CosmosMediaRepository } from '@/modules/media/repository/media.cosmos.repository';
import { DrizzleThreadRepository } from '@/modules/thread/repository/thread.drizzle.repository';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { UserService } from '@/modules/users/service/user.service';

function loadEnvFromBackendRoot(): void {
  const root = process.cwd();
  for (const name of ['.env.local', '.env']) {
    const path = resolve(root, name);
    if (existsSync(path)) {
      dotenv.config({ path });
      return;
    }
  }
}

function parseMode(): 'INSERT_ONLY' | 'RESET_DATA' {
  const reset = process.argv.includes('--reset');
  return reset ? 'RESET_DATA' : 'INSERT_ONLY';
}

async function main(): Promise<void> {
  loadEnvFromBackendRoot();

  const mode = parseMode();
  if (isInMemoryMode()) {
    // biome-ignore lint/suspicious/noConsole: script CLI
    console.error('Seeding is not supported in in-memory mode');
    process.exit(1);
  }
  const userRepository = new DrizzleUserRepository();
  const articleRepository = new CosmosArticleRepository();
  const cityRepository = new DrizzleCityRepository();
  const accessRepository = new DrizzleAccessRepository();
  const mediaRepository = new CosmosMediaRepository();
  const mediaBlobService = new AzureMediaBlobService();
  const configRepository = new CosmosConfigRepository();
  const establishmentRepository = new DrizzleEstablishmentRepository();
  const threadRepository = new DrizzleThreadRepository();
  const iamService = new KeycloakIAMService();
  const userService = new UserService(userRepository, iamService);
  const cityService = new CityService(cityRepository, userService, iamService);
  const accessService = new AccessService(accessRepository, cityService, userService);

  await runSeeders(
    {
      userService,
      articleRepository,
      cityRepository,
      iamService,
      accessService,
      mediaRepository,
      mediaBlobService,
      configRepository,
      establishmentRepository,
      threadRepository,
    },
    mode,
  );
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(`[seeding] done (mode=${mode})`);
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error('[seeding] failed', err);
  process.exit(1);
});
