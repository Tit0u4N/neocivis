import type { KyInstance } from 'ky';

export default abstract class AbstractService {
  protected http: KyInstance;

  protected constructor(kyInstance: KyInstance, prefixUrl: string = '') {
    this.http = kyInstance.extend((parentOptions) => ({
      prefixUrl: parentOptions.prefixUrl + prefixUrl,
    }));
  }

  protected static createCityPath(cityId: string): string {
    return `/city/${cityId}`;
  }
}
