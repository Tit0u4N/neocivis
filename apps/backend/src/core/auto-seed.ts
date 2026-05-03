import { getAutoSeedMode, isInMemoryMode } from '@/core/runtime-config';
import type { IArticleRepository } from '@/modules/article/repository/article.repository.interface';
import { ArticleSeeder } from '@/modules/article/seed/article.seeder';
import { UserSeeder } from '@/modules/users/seed/user.seeder';
import type { UserService } from '@/modules/users/service/user.service';
import type { AutoSeedMode } from './runtime-config';
import type { ISeeder } from './seeder.interface';

export type AutoSeedDeps = {
  userService: UserService;
  articleRepository: IArticleRepository;
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
  const seederList: ISeeder[] = [new UserSeeder(deps.userService), new ArticleSeeder(deps.articleRepository)];

  await Promise.all(
    seederList.map(async (seeder) => {
      if (mode === 'RESET_DATA') {
        await seeder.deleteAll();
      }
      await seeder.seed();
    }),
  );
}
