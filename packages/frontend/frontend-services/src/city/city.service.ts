import type { CityPublicDto, OperationSuccessDto } from '@repo/contracts';
import type { KyInstance } from 'ky';

export class CityService {
  constructor(private readonly api: KyInstance) {}

  async listCities(): Promise<CityPublicDto[]> {
    return await this.api.get('cities').json<CityPublicDto[]>();
  }

  async joinCity(cityId: string): Promise<OperationSuccessDto> {
    return await this.api.post(`cities/${cityId}/join`).json<OperationSuccessDto>();
  }

  async leaveCity(cityId: string): Promise<OperationSuccessDto> {
    return await this.api.delete(`cities/${cityId}/leave`).json<OperationSuccessDto>();
  }
}
