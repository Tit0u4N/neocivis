import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '../city.service';
import type { UserService } from '@/modules/users/service/user.service';
import { citySeeds } from './city.seed';
import type { ICityRepository } from '../repository/city.repository.interface';

function normalizePrefix(name: string): string {
  const onlyLetters = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  return onlyLetters.slice(0, 3).padEnd(3, 'X');
}

function randomFiveDigits(): string {
  const n = Math.floor(Math.random() * 100000);
  return String(n).padStart(5, '0');
}

function buildCityId(prefix: string): string {
  return `${prefix}_${randomFiveDigits()}`;
}

export class CitySeeder implements ISeeder {
  constructor(
    private cityRepository: ICityRepository,
    private cityService: CityService,
    private userService: UserService,
  ) {}

  async deleteAll(): Promise<void> {
    await this.cityRepository.deleteAll();
  }

  async seed(): Promise<void> {
    const users = await this.userService.getAll();
    const byUsername = new Map(users.map((u) => [u.username, u]));

    const existing = await this.cityService.listPublicCities();
    const existingIds = new Set(existing.map((c) => c.id));

    for (const seed of citySeeds) {
      const admin = byUsername.get(seed.adminUsername);
      if (!admin) {
        throw new Error(`Missing seeded admin user in DB: ${seed.adminUsername}`);
      }

      const prefix = normalizePrefix(seed.name);
      let id = buildCityId(prefix);
      for (let i = 0; i < 50 && existingIds.has(id); i++) {
        id = buildCityId(prefix);
      }
      if (existingIds.has(id)) {
        throw new Error(`Unable to generate unique city id for ${seed.name}`);
      }
      existingIds.add(id);

      await this.cityRepository.createCity({
        id,
        name: seed.name,
        description: `Ville de ${seed.name}`,
        adminUserId: admin.id,
      });

      for (const empUsername of seed.employeeUsernames) {
        const emp = byUsername.get(empUsername);
        if (!emp) {
          throw new Error(`Missing seeded employee user in DB: ${empUsername}`);
        }
        await this.cityService.assignEmployee(id, emp.id);
      }

      for (const citizenUsername of seed.citizenUsernames) {
        const citizen = byUsername.get(citizenUsername);
        if (!citizen) {
          throw new Error(`Missing seeded citizen user in DB: ${citizenUsername}`);
        }
        await this.cityRepository.addCitizen(id, citizen.id);
      }
    }
  }
}

