import type { ISeeder } from '@/core/seeder.interface';
import type { IEstablishmentRepository } from '../repository/establishment.repository.interface';
import { getEstablishmentSeeds } from './establishment.seed';

export class EstablishmentSeeder implements ISeeder {
  constructor(private repository: IEstablishmentRepository) {}

  async deleteAll(): Promise<void> {
    const existing = await this.repository.list();
    for (const e of existing) {
      await this.repository.delete(e.id);
    }
  }

  async seed(): Promise<void> {
    const seeds = getEstablishmentSeeds();
    for (const establishment of seeds) {
      const existing = await this.repository.getById(establishment.id);
      if (!existing) {
        await this.repository.create(establishment);
      }
    }
  }
}
