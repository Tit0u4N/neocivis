import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IMediaRepository } from '../repository/media.repository.interface';
import { buildMediaSeed, mediaSeedsByCityName } from './media.seed';

export class MediaSeeder implements ISeeder {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly cityService: CityService,
  ) {}

  async deleteAll(): Promise<void> {
    const all = await this.mediaRepository.findAll();
    for (const media of all) {
      await this.mediaRepository.delete(media.id);
    }
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      const entries = mediaSeedsByCityName.get(city.name);
      if (!entries) {
        continue;
      }
      const items = buildMediaSeed(city.id, entries);
      for (const item of items) {
        await this.mediaRepository.create(item);
      }
    }
  }
}
