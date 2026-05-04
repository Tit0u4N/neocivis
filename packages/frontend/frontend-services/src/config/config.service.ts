import type { CarouselItem, Category, CitizenConfigResponse, MunicipalityConfigResponse } from '@repo/contracts/config';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class ConfigService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, '');
  }

  async getConfig(locale = 'fr'): Promise<CitizenConfigResponse> {
    return await this.http.get('config', { searchParams: { locale } }).json<CitizenConfigResponse>();
  }

  async getMunicipalityConfig(): Promise<MunicipalityConfigResponse> {
    return await this.http.get('config').json<MunicipalityConfigResponse>();
  }

  async setCategories(categories: Category[]): Promise<Category[]> {
    return await this.http.put('config/categories', { json: categories }).json<Category[]>();
  }

  async setCarouselItems(items: CarouselItem[]): Promise<CarouselItem[]> {
    return await this.http.put('config/carousel', { json: items }).json<CarouselItem[]>();
  }
}
