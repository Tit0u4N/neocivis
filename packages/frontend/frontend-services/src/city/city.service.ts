import type { CityPublicDto, OperationSuccessDto } from '@repo/contracts';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class CityService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, { cityScoped: false });
  }

  async listCities(): Promise<CityPublicDto[]> {
    return await this.http.get('cities').json<CityPublicDto[]>();
  }

  async joinCity(cityId: string): Promise<OperationSuccessDto> {
    return await this.http.post(`cities/${cityId}/join`).json<OperationSuccessDto>();
  }

  async leaveCity(cityId: string): Promise<OperationSuccessDto> {
    return await this.http.delete(`cities/${cityId}/leave`).json<OperationSuccessDto>();
  }
}
