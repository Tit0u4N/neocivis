import type { UserMeDto, UserPublicDto } from '@repo/contracts';
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
}
