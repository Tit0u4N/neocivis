import type {
  CreateRoleInput,
  EmployeeRolesDto,
  OperationSuccessDto,
  PermissionDto,
  RoleDto,
  UpdateRoleInput,
} from '@repo/contracts';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class AccessService extends AbstractService {
  private readonly catalogHttp: KyInstance;

  constructor(kyInstance: KyInstance, cityId: string) {
    super(kyInstance, { cityId });
    this.catalogHttp = kyInstance;
  }

  async listPermissionCatalog(): Promise<PermissionDto[]> {
    return await this.catalogHttp.get('permissions').json<PermissionDto[]>();
  }

  async listRoles(): Promise<RoleDto[]> {
    return await this.http.get('roles').json<RoleDto[]>();
  }

  async getRole(roleId: string): Promise<RoleDto> {
    return await this.http.get(`roles/${roleId}`).json<RoleDto>();
  }

  async createRole(input: CreateRoleInput): Promise<RoleDto> {
    return await this.http.post('roles', { json: input }).json<RoleDto>();
  }

  async updateRole(roleId: string, input: UpdateRoleInput): Promise<RoleDto> {
    return await this.http.put(`roles/${roleId}`, { json: input }).json<RoleDto>();
  }

  async deleteRole(roleId: string): Promise<OperationSuccessDto> {
    return await this.http.delete(`roles/${roleId}`).json<OperationSuccessDto>();
  }

  async listEmployeeRoles(userId: number): Promise<EmployeeRolesDto> {
    return await this.http.get(`employees/${userId}/roles`).json<EmployeeRolesDto>();
  }

  async assignRole(userId: number, roleId: string): Promise<OperationSuccessDto> {
    return await this.http.post(`employees/${userId}/roles/${roleId}`).json<OperationSuccessDto>();
  }

  async unassignRole(userId: number, roleId: string): Promise<OperationSuccessDto> {
    return await this.http.delete(`employees/${userId}/roles/${roleId}`).json<OperationSuccessDto>();
  }
}
