import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import dotenv from 'dotenv';

import { runSeeders } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { DrizzleCityRepository } from '@/modules/city/repository/city.drizzle.repository';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
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
  const iamService = new KeycloakIAMService();
  const userService = new UserService(userRepository, iamService);

  await runSeeders({ userService, articleRepository, cityRepository, iamService }, mode);
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.info(`[seeding] done (mode=${mode})`);
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error('[seeding] failed', err);
  process.exit(1);
});
