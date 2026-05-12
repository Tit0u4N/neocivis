import type { CarouselItem, Category, CitizenConfigResponse, MunicipalityConfigResponse } from '@repo/contracts/config';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class ConfigService extends AbstractService {
  constructor(kyInstance: KyInstance, cityId: string) {
    super(kyInstance, `/config${AbstractService.createCityPath(cityId)}`);
  }

  async getConfig(locale = 'fr'): Promise<CitizenConfigResponse> {
    return await this.http.get(locale).json<CitizenConfigResponse>();
  }

  async getMunicipalityConfig(): Promise<MunicipalityConfigResponse> {
    return await this.http.get('all').json<MunicipalityConfigResponse>();
  }

  async setCategories(categories: Category[]): Promise<Category[]> {
    return await this.http.put('categories', { json: categories }).json<Category[]>();
  }

  async setCarouselItems(items: CarouselItem[]): Promise<CarouselItem[]> {
    return await this.http.put('carousel', { json: items }).json<CarouselItem[]>();
  }
}
