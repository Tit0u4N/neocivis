import type { CityPublicDto, OperationSuccessDto, UpdateCityInput, UserPublicDto } from '@repo/contracts';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class CityService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, { cityScoped: false });
  }

  // ── Citizen gateway ───────────────────────────────────────────────────────

  async listCities(): Promise<CityPublicDto[]> {
    return await this.http.get('cities').json<CityPublicDto[]>();
  }

  async joinCity(cityId: string): Promise<OperationSuccessDto> {
    return await this.http.post(`cities/${cityId}/join`).json<OperationSuccessDto>();
  }

  async leaveCity(cityId: string): Promise<OperationSuccessDto> {
    return await this.http.delete(`cities/${cityId}/leave`).json<OperationSuccessDto>();
  }

  // ── Municipality gateway ──────────────────────────────────────────────────

  async updateCity(cityId: string, input: UpdateCityInput): Promise<CityPublicDto> {
    return await this.http.patch(`cities/${cityId}`, { json: input }).json<CityPublicDto>();
  }

  async listCitizens(cityId: string): Promise<UserPublicDto[]> {
    return await this.http.get(`cities/${cityId}/citizens`).json<UserPublicDto[]>();
  }

  async listEmployees(cityId: string): Promise<UserPublicDto[]> {
    return await this.http.get(`cities/${cityId}/employees`).json<UserPublicDto[]>();
  }

  async createAndAssignEmployee(
    cityId: string,
    input: { username: string; email: string; firstName: string; lastName: string },
  ): Promise<OperationSuccessDto> {
    return await this.http.post(`cities/${cityId}/employees`, { json: input }).json<OperationSuccessDto>();
  }

  async unassignEmployee(cityId: string, userId: number): Promise<OperationSuccessDto> {
    return await this.http.delete(`cities/${cityId}/employees/${userId}`).json<OperationSuccessDto>();
  }
}
