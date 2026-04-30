import { getAutoSeedMode } from '@/core/runtime-config';
import type { IArticleRepository } from '@/modules/article/article.repository';
import { ArticleSeeder } from '@/modules/article/seed/article.seeder';
import { UserSeeder } from '@/modules/users/seed/user.seeder';
import type { UserService } from '@/modules/users/user.service';
import type { ISeeder } from './seeder.interface';

type AutoSeedDeps = {
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

export function startAutoSeedOnStartup(deps: AutoSeedDeps): void {
  const mode = getAutoSeedMode();
  if (!mode) {
    return;
  }
  if (hasStarted()) {
    return;
  }
  markStarted();

  const seederList: ISeeder[] = [new UserSeeder(deps.userService), new ArticleSeeder(deps.articleRepository)];

  (async () => {
    for (const seeder of seederList) {
      if (mode === 'RESET_DATA') {
        await seeder.deleteAll();
      }
      await seeder.seed();
    }
  })().catch((err: unknown) => {
    // biome-ignore lint/suspicious/noConsole: startup seeding diagnostics
    console.error('[auto-seed] failed', err);
  });
}
