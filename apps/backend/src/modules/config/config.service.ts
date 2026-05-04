import type {
  ArticleLocale,
  CarouselItem,
  CarouselItemResolved,
  Category,
  CategoryResolved,
  CitizenConfigResponse,
  MunicipalityConfigResponse,
} from '@repo/contracts/config';
import type { IConfigRepository } from './config.repository';

export class ConfigService {
  constructor(private repository: IConfigRepository) {}

  async getConfig(locale: ArticleLocale): Promise<CitizenConfigResponse> {
    const [carouselItems, categories] = await Promise.all([
      this.repository.getCarouselItems(),
      this.repository.getCategories(),
    ]);

    return {
      carousel: carouselItems.sort((a, b) => a.order - b.order).map((item) => this.resolveCarouselItem(item, locale)),
      categories: categories.map((cat) => this.resolveCategory(cat, locale)),
    };
  }

  async getMunicipalityConfig(): Promise<MunicipalityConfigResponse> {
    const [categories, carousel] = await Promise.all([
      this.repository.getCategories(),
      this.repository.getCarouselItems(),
    ]);
    return { categories, carousel };
  }

  async setCategories(categories: Category[]): Promise<Category[]> {
    return await this.repository.setCategories(categories);
  }

  async setCarouselItems(items: CarouselItem[]): Promise<CarouselItem[]> {
    return await this.repository.setCarouselItems(items);
  }

  private resolveCarouselItem(item: CarouselItem, locale: ArticleLocale): CarouselItemResolved {
    const t =
      item.translations.find((tr) => tr.locale === locale) ?? item.translations.find((tr) => tr.locale === 'fr')!;
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

  private resolveCategory(cat: Category, locale: ArticleLocale): CategoryResolved {
    const t = cat.translations.find((tr) => tr.locale === locale) ?? cat.translations.find((tr) => tr.locale === 'fr')!;
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
