import type {
  CarouselItem,
  CarouselItemResolved,
  Category,
  CategoryResolved,
  CitizenConfigResponse,
  ConfigLocale,
  MunicipalityConfigResponse,
} from '@repo/contracts/config';
import type { IConfigRepository } from '../repository/config.repository.interface';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { appendMediaLink } from '@/modules/media/repository/media.repository.interface';
import type { MediaImageLink } from '@repo/contracts/media';

export class ConfigService {
  constructor(
    private repository: IConfigRepository,
    private mediaRepository?: IMediaRepository,
  ) {}

  async getConfig(cityId: string, locale: ConfigLocale): Promise<CitizenConfigResponse> {
    const [carouselItems, categories] = await Promise.all([
      this.repository.getCarouselItems(cityId),
      this.repository.getCategories(cityId),
    ]);

    return {
      carousel: carouselItems.sort((a, b) => a.order - b.order).map((item) => this.resolveCarouselItem(item, locale)),
      categories: categories.map((cat) => this.resolveCategory(cat, locale)),
    };
  }

  async getMunicipalityConfig(cityId: string): Promise<MunicipalityConfigResponse> {
    const [categories, carousel] = await Promise.all([
      this.repository.getCategories(cityId),
      this.repository.getCarouselItems(cityId),
    ]);
    return { categories, carousel };
  }

  async setCategories(cityId: string, categories: Category[]): Promise<Category[]> {
    return await this.repository.setCategories(cityId, categories);
  }

  async setCarouselItems(cityId: string, items: CarouselItem[]): Promise<CarouselItem[]> {
    const previous = await this.repository.getCarouselItems(cityId);
    const saved = await this.repository.setCarouselItems(cityId, items);

    const mediaRepository = this.mediaRepository;
    if (mediaRepository) {
      await this.syncCarouselMediaLinks(mediaRepository, cityId, previous, saved);
    }

    return saved;
  }

  private async syncCarouselMediaLinks(
    mediaRepository: IMediaRepository,
    cityId: string,
    previous: CarouselItem[],
    next: CarouselItem[],
  ): Promise<void> {
    const media = await mediaRepository.findByCityId(cityId);
    if (media.length === 0) {
      return;
    }

    const previousIds = new Set(previous.map((i) => i.id));
    const nextIds = new Set(next.map((i) => i.id));
    const mediaByUrl = new Map(media.map((m) => [m.url, m]));

    await this.removeLinksForRemovedCarouselItems(mediaRepository, media, previousIds, nextIds);
    await this.ensureLinksForNextCarouselItems(mediaRepository, mediaByUrl, previous, previousIds, next);
    await this.cleanupStaleCarouselLinks(mediaRepository, media, new Set(next.map((i) => i.id)));
  }

  private async removeLinksForRemovedCarouselItems(
    mediaRepository: IMediaRepository,
    media: Awaited<ReturnType<IMediaRepository['findByCityId']>>,
    previousIds: Set<string>,
    nextIds: Set<string>,
  ): Promise<void> {
    const removedIds = [...previousIds].filter((id) => !nextIds.has(id));
    if (removedIds.length === 0) {
      return;
    }
    const removedSet = new Set(removedIds);
    for (const m of media) {
      const filtered = m.links.filter((l) => !(l.type === 'carousel' && removedSet.has(l.idLink)));
      if (filtered.length !== m.links.length) {
        await mediaRepository.update(m.id, { links: filtered });
      }
    }
  }

  private async ensureLinksForNextCarouselItems(
    mediaRepository: IMediaRepository,
    mediaByUrl: Map<string, Awaited<ReturnType<IMediaRepository['findByCityId']>>[number]>,
    previous: CarouselItem[],
    previousIds: Set<string>,
    next: CarouselItem[],
  ): Promise<void> {
    for (const item of next) {
      const url = item.imageUrl;
      if (!url) {
        continue;
      }
      const m = mediaByUrl.get(url);
      if (!m) {
        continue;
      }

      const link: MediaImageLink = {
        idLink: item.id,
        type: 'carousel',
        title: item.translations.find((t) => t.locale === 'fr')?.title ?? item.id,
      };
      const updatedLinks = appendMediaLink(m.links, link);
      if (updatedLinks !== m.links) {
        await mediaRepository.update(m.id, { links: updatedLinks });
        m.links = updatedLinks;
      }

      if (previousIds.has(item.id)) {
        const prevItem = previous.find((p) => p.id === item.id);
        if (prevItem?.imageUrl && prevItem.imageUrl !== url) {
          const prevMedia = mediaByUrl.get(prevItem.imageUrl);
          if (prevMedia) {
            const filtered = prevMedia.links.filter((l) => !(l.type === 'carousel' && l.idLink === item.id));
            if (filtered.length !== prevMedia.links.length) {
              await mediaRepository.update(prevMedia.id, { links: filtered });
            }
          }
        }
      }
    }
  }

  private async cleanupStaleCarouselLinks(
    mediaRepository: IMediaRepository,
    media: Awaited<ReturnType<IMediaRepository['findByCityId']>>,
    nextIds: Set<string>,
  ): Promise<void> {
    for (const m of media) {
      const filtered = m.links.filter((l) => l.type !== 'carousel' || nextIds.has(l.idLink));
      if (filtered.length !== m.links.length) {
        await mediaRepository.update(m.id, { links: filtered });
      }
    }
  }

  private pickLocale<T extends { locale: ConfigLocale }>(items: T[], locale: ConfigLocale): T {
    const byLocale = items.find((it) => it.locale === locale);
    if (byLocale) {
      return byLocale;
    }
    const byFr = items.find((it) => it.locale === 'fr');
    if (byFr) {
      return byFr;
    }
    const first = items[0];
    if (!first) {
      throw new Error('Missing translations');
    }
    return first;
  }

  private resolveCarouselItem(item: CarouselItem, locale: ConfigLocale): CarouselItemResolved {
    const t = this.pickLocale(item.translations, locale);
    return {
      id: item.id,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      order: item.order,
      title: t.title,
      description: t.description,
      tag: t.tag,
    };
  }

  private resolveCategory(cat: Category, locale: ConfigLocale): CategoryResolved {
    const t = this.pickLocale(cat.translations, locale);
    return {
      id: cat.id,
      attachedPageId: cat.attachedPageId,
      icon: cat.icon,
      color: cat.color,
      row: cat.row,
      col: cat.col,
      colSpan: cat.colSpan,
      rowSpan: cat.rowSpan,
      name: t.name,
    };
  }
}
