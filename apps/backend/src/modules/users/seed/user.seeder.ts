import type { AutoSeedMode } from '@/core/runtime-config';
import type { ISeeder } from '@/core/seeder.interface';
import type { UserService } from '../user.service';
import { loadSeededUsersFromRealmConfigDev } from './user.seed';

export class UserSeeder implements ISeeder {
  constructor(private userService: UserService) {}

  async autoSeed(mode: AutoSeedMode): Promise<void> {
    const seeded = loadSeededUsersFromRealmConfigDev();
    if (seeded.length === 0) {
      return;
    }

    if (mode === 'RESET_DATA') {
      await this.deleteAll();
    }
    await this.seed();

    // Après insert d'IDs explicites, on positionne la séquence au bon next id.
    const nextId = Math.max(...seeded.map((u) => u.seedId)) + 1;
    await this.userService.setNextId(nextId);
  }

  async deleteAll(): Promise<void> {
    await this.userService.deleteAll();
    await this.userService.setNextId(1);
  }

  async seed(): Promise<void> {
    const seededUsers = loadSeededUsersFromRealmConfigDev();
    for (const seeded of seededUsers) {
      const kcUser = await this.userService.getIamUserByUsername(seeded.username);
      const keycloakId = kcUser?.id ?? `seed:${seeded.username}`;

      await this.userService.seedFromKeycloak({
        id: seeded.seedId,
        keycloakId,
        role: seeded.role,
        username: kcUser?.username ?? seeded.username,
        email: kcUser?.email ?? seeded.email,
        firstName: kcUser?.firstName ?? seeded.firstName,
        lastName: kcUser?.lastName ?? seeded.lastName,
      });
    }
  }
}
