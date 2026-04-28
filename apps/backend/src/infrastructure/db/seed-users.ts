import { getAutoSeedMode } from '@/core/runtime-config';
import { requiredEnv } from '@/infrastructure/env';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { UserSeeder } from '@/modules/users/seed/user.seeder';
import { UserService } from '@/modules/users/user.service';

async function main(): Promise<void> {
  // DB is required for this seeder.
  requiredEnv('DATABASE_URL');

  const repo = new DrizzleUserRepository();
  const service = new UserService(repo);
  const seeder = new UserSeeder(service);

  await seeder.autoSeed(getAutoSeedMode() ?? 'INSERT_ONLY');
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error(err);
  process.exit(1);
});
