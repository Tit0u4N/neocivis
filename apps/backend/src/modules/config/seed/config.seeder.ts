import type { CarouselItem } from '@repo/contracts/config';
import type { MediaImageLink } from '@repo/contracts/media';
import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IConfigRepository } from '@/modules/config/repository/config.repository.interface';
import {
  type CarouselSeedTemplate,
  getCarouselSeedsForCity,
  getMockCategories,
} from '@/modules/config/seed/config.seed';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { appendMediaLink } from '@/modules/media/repository/media.repository.interface';

export class ConfigSeeder implements ISeeder {
  constructor(
    private readonly configRepository: IConfigRepository,
    private readonly mediaRepository: IMediaRepository,
    private readonly cityService: CityService,
  ) {}

  async deleteAll(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      const existingCarousel = await this.configRepository.getCarouselItems(city.id);
      await this.configRepository.setCarouselItems(city.id, []);
      await this.configRepository.setCategories(city.id, []);

      if (existingCarousel.length > 0) {
        const removedIds = new Set(existingCarousel.map((i) => i.id));
        const mediaList = await this.mediaRepository.findByCityId(city.id);
        for (const media of mediaList) {
          const filtered = media.links.filter((l) => !(l.type === 'carousel' && removedIds.has(l.idLink)));
          if (filtered.length !== media.links.length) {
            await this.mediaRepository.update(media.id, { links: filtered });
          }
        }
      }
    }
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      const templates = getCarouselSeedsForCity(city.name);
      if (templates.length === 0) {
        continue;
      }

      await this.configRepository.setCategories(city.id, getMockCategories());
      const resolvedCarousel = await this.resolveCarouselWithMedia(templates);
      await this.configRepository.setCarouselItems(city.id, resolvedCarousel);
    }
  }

  private async resolveCarouselWithMedia(templates: CarouselSeedTemplate[]): Promise<CarouselItem[]> {
    const resolved: CarouselItem[] = [];

    for (const template of templates) {
      const media = await this.mediaRepository.findById(template.mediaId);
      if (!media) {
        resolved.push({
          id: template.id,
          order: template.order,
          translations: template.translations,
        });
        continue;
      }

      const link: MediaImageLink = {
        idLink: template.id,
        type: 'carousel',
        title: template.translations.find((t) => t.locale === 'fr')?.title ?? template.id,
      };
      await this.mediaRepository.update(media.id, {
        links: appendMediaLink(media.links, link),
      });

      resolved.push({
        id: template.id,
        imageUrl: media.url,
        order: template.order,
        translations: template.translations,
      });
    }

    return resolved;
  }
}
