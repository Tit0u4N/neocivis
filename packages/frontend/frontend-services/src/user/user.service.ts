import type { OperationSuccessDto, UserMeDto, UserPublicDto } from '@repo/contracts';
import type { UpdateAccountInput } from '@repo/contracts/user-schema';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class UserService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, { cityScoped: false });
  }

  async getByIds(ids: number[]): Promise<UserPublicDto[]> {
    if (ids.length === 0) {
      return [];
    }
    return await this.http.get('user/by-ids', { searchParams: { ids: ids.join(',') } }).json<UserPublicDto[]>();
  }

  async getMe(): Promise<UserMeDto> {
    return await this.http.get('user/me').json<UserMeDto>();
  }

  async updateMe(input: UpdateAccountInput): Promise<OperationSuccessDto> {
    return await this.http.patch('user/me', { json: input }).json<OperationSuccessDto>();
  }

  async changePassword(): Promise<OperationSuccessDto> {
    return await this.http.post('user/me/change-password').json<OperationSuccessDto>();
  }
}
