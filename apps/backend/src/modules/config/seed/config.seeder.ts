import type { CarouselItem } from '@repo/contracts/config';
import type { MediaImageLink } from '@repo/contracts/media';
import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IConfigRepository } from '@/modules/config/repository/config.repository.interface';
import { getMockCarouselItems, getMockCategories } from '@/modules/config/seed/config.seed';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { appendMediaLink } from '@/modules/media/repository/media.repository.interface';
import { NICE_MEDIA_IDS } from '@/modules/media/seed/media.seed';

const CAROUSEL_MEDIA_BY_ITEM_ID: Record<string, string> = {
  'carousel-1': NICE_MEDIA_IDS.carousel1,
  'carousel-2': NICE_MEDIA_IDS.carousel2,
  'carousel-3': NICE_MEDIA_IDS.carousel3,
};

export class ConfigSeeder implements ISeeder {
  constructor(
    private readonly configRepository: IConfigRepository,
    private readonly mediaRepository: IMediaRepository,
    private readonly cityService: CityService,
  ) {}

  async deleteAll(): Promise<void> {
    await this.configRepository.setCarouselItems([]);
    await this.configRepository.setCategories([]);
  }

  async seed(): Promise<void> {
    const nice = (await this.cityService.listPublicCities()).find((c) => c.name === 'Nice');
    if (!nice) {
      return;
    }

    await this.configRepository.setCategories(getMockCategories());

    const resolvedCarousel: CarouselItem[] = [];
    for (const item of getMockCarouselItems()) {
      const mediaId = CAROUSEL_MEDIA_BY_ITEM_ID[item.id];
      if (!mediaId) {
        resolvedCarousel.push(item);
        continue;
      }
      const media = await this.mediaRepository.findById(mediaId);
      if (!media) {
        resolvedCarousel.push(item);
        continue;
      }
      const link: MediaImageLink = {
        idLink: item.id,
        type: 'carousel',
        title: item.translations.find((t) => t.locale === 'fr')?.title ?? item.id,
      };
      await this.mediaRepository.update(media.id, {
        links: appendMediaLink(media.links, link),
      });
      resolvedCarousel.push({ ...item, imageUrl: media.url });
    }

    await this.configRepository.setCarouselItems(resolvedCarousel);
  }
}
