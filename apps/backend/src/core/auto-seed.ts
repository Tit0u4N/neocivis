import { getAutoSeedMode } from '@/core/runtime-config';
import { UserSeeder } from '@/modules/users/seed/user.seeder';
import type { UserService } from '@/modules/users/user.service';

type AutoSeedDeps = {
  userService: UserService;
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

  const seeder = new UserSeeder(deps.userService);

  seeder.autoSeed(mode).catch((err: unknown) => {
    // biome-ignore lint/suspicious/noConsole: startup seeding diagnostics
    console.error('[auto-seed] failed', err);
  });
}
