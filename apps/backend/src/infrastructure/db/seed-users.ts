import { requiredEnv } from '@/infrastructure/env';
import { KeycloakIAMService } from '@/infrastructure/iam/keycloak-iam.service';
import { DrizzleUserRepository } from '@/modules/users/user.drizzle.repository';
import { seededUsers } from '@/modules/users/user.seed';
import { UserService } from '@/modules/users/user.service';

async function main(): Promise<void> {
  // DB is required for this seeder.
  requiredEnv('DATABASE_URL');

  const iam = new KeycloakIAMService();
  const repo = new DrizzleUserRepository();
  const service = new UserService(repo);

  for (const seeded of seededUsers) {
    const user = await iam.getUserByUsername(seeded.username);
    if (!user) {
      // biome-ignore lint/suspicious/noConsole: script CLI
      console.warn(`[seed-users] user not found in Keycloak: ${seeded.username}`);
      continue;
    }

    await service.syncFromHeaders({
      seedId: seeded.seedId,
      keycloakId: user.id,
      role: 'CITIZEN',
      username: user.username ?? seeded.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // biome-ignore lint/suspicious/noConsole: script CLI
    console.info(`[seed-users] synced: ${seeded.username} (seedId=${seeded.seedId}) -> ${user.id}`);
  }
}

main().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole: script CLI
  console.error(err);
  process.exit(1);
});

