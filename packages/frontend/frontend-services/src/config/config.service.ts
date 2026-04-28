import type { CitizenConfigResponse } from '@repo/contracts/config';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class ConfigService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, '');
  }

  async getConfig(locale = 'fr'): Promise<CitizenConfigResponse> {
    return await this.http.get('config', { searchParams: { locale } }).json<CitizenConfigResponse>();
  }
}
