import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { AccessService } from '../access.service';
import { accessRoleSeedsByCityName } from './access.seed';

export class AccessSeeder implements ISeeder {
  constructor(
    private accessService: AccessService,
    private cityService: CityService,
  ) {}

  async deleteAll(): Promise<void> {
    await this.accessService.deleteAll();
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      const seeds = accessRoleSeedsByCityName.get(city.name);
      if (!seeds) {
        continue;
      }
      const existing = await this.accessService.listRolesForCity(city.id);
      const existingByName = new Map(existing.map((r) => [r.name, r]));
      for (const seed of seeds) {
        if (existingByName.has(seed.name)) {
          continue;
        }
        await this.accessService.createRoleSeeded({
          cityId: city.id,
          name: seed.name,
          description: seed.description,
          permissions: [...seed.permissions],
        });
      }
    }
  }
}
