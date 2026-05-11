import { getAutoSeedMode, isInMemoryMode } from '@/core/runtime-config';
import type { AccessService } from '@/modules/access/access.service';
import { AccessSeeder } from '@/modules/access/seed/access.seeder';
import type { IArticleRepository } from '@/modules/article/repository/article.repository.interface';
import { ArticleSeeder } from '@/modules/article/seed/article.seeder';
import type { ICityRepository } from '@/modules/city/repository/city.repository.interface';
import { CityService } from '@/modules/city/city.service';
import { CitySeeder } from '@/modules/city/seed/city.seeder';
import { UserSeeder } from '@/modules/users/seed/user.seeder';
import type { UserService } from '@/modules/users/service/user.service';
import type { IAMService } from '@/modules/iam/iam.service';
import type { AutoSeedMode } from './runtime-config';
import type { ISeeder } from './seeder.interface';

export type AutoSeedDeps = {
  userService: UserService;
  articleRepository: IArticleRepository;
  cityRepository: ICityRepository;
  iamService: IAMService;
  accessService: AccessService;
};

const AUTO_SEED_GLOBAL_KEY = '__neocivis_auto_seed_started__';

function hasStarted(): boolean {
  return (globalThis as Record<string, unknown>)[AUTO_SEED_GLOBAL_KEY] === true;
}

function markStarted(): void {
  (globalThis as Record<string, unknown>)[AUTO_SEED_GLOBAL_KEY] = true;
}

export async function startAutoSeedOnStartup(deps: AutoSeedDeps): Promise<void> {
  const mode = getAutoSeedMode();
  if (!mode) {
    return;
  }
  // If the auto-seed has already started and we are not in in-memory mode, we don't need to start it again.
  // In in-memory mode, we can start the seed again since it's only in memory and won't be present in both function.
  if (hasStarted() && !isInMemoryMode()) {
    return;
  }
  markStarted();

  await runSeeders(deps, mode).catch((err: unknown) => {
    // biome-ignore lint/suspicious/noConsole: startup seeding diagnostics
    console.error('[auto-seed] failed', err);
  });
}

export async function runSeeders(deps: AutoSeedDeps, mode: AutoSeedMode): Promise<void> {
  const cityService = new CityService(deps.cityRepository, deps.userService, deps.iamService);
  const seederList: ISeeder[] = [
    new UserSeeder(deps.userService),
    new CitySeeder(deps.cityRepository, cityService, deps.userService),
    new AccessSeeder(deps.accessService, cityService),
    new ArticleSeeder(deps.articleRepository),
  ];

  for (const seeder of seederList) {
    if (mode === 'RESET_DATA') {
      await seeder.deleteAll();
    }
    await seeder.seed();
  }
}
