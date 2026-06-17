import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { MediaLinkService } from '@/modules/media/service/media-link.service';
import type { EstablishmentEntity } from '../establishment.types';
import type { IEstablishmentRepository } from '../repository/establishment.repository.interface';
import { getEstablishmentTemplates } from './establishment.seed';

export class EstablishmentSeeder implements ISeeder {
  private readonly mediaLinkService?: MediaLinkService;

  constructor(
    private readonly repository: IEstablishmentRepository,
    private readonly cityService: CityService,
    private readonly mediaRepository?: IMediaRepository,
  ) {
    this.mediaLinkService = mediaRepository ? new MediaLinkService(mediaRepository) : undefined;
  }

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      const templates = getEstablishmentTemplates(city.name);
      for (const template of templates) {
        const existing = await this.repository.getByIdAndCityId(template.id, city.id);
        if (existing) {
          continue;
        }
        const imageUrl = await this.resolveImageUrl(template.mediaId, city.id, template.fallbackImageUrl);
        const entity: EstablishmentEntity = {
          id: template.id,
          cityId: city.id,
          name: template.name,
          type: template.type,
          address: template.address,
          hours: template.hours,
          phone: template.phone,
          imageUrl,
        };
        await this.repository.create(entity);
        await this.mediaLinkService?.syncEstablishmentMediaLinks(entity);
      }
    }
  }

  private async resolveImageUrl(mediaId: string, cityId: string, fallback: string): Promise<string> {
    if (!this.mediaRepository) {
      return fallback;
    }
    const media = await this.mediaRepository.findByIdAndCityId(mediaId, cityId);
    return media?.url ?? fallback;
  }
}
