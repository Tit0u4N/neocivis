import type { CityPublicDto } from '@repo/contracts/city';
import type { IAMService } from '@/modules/iam/iam.service';
import type { UserService } from '@/modules/users/service/user.service';
import type { User } from '@/modules/users/user.types';
import { toCityPublicDto } from './city.types';
import type { ICityRepository } from './repository/city.repository.interface';

export type CreateEmployeeInput = Readonly<{
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}>;

export class CityService {
  constructor(
    private repository: ICityRepository,
    private userService: UserService,
    private iamService: IAMService,
  ) {}

  async listPublicCities(): Promise<CityPublicDto[]> {
    const cities = await this.repository.listCities();
    return cities.map(toCityPublicDto);
  }

  async getCityPublicById(cityId: string): Promise<CityPublicDto | null> {
    const city = await this.repository.getCityById(cityId);
    return city ? toCityPublicDto(city) : null;
  }

  async updateCityDescription(cityId: string, description: string): Promise<CityPublicDto> {
    const updated = await this.repository.updateCityDescription(cityId, description);
    return toCityPublicDto(updated);
  }

  async joinCity(cityId: string, citizenUser: User): Promise<void> {
    if (citizenUser.role !== 'CITIZEN') {
      throw new Error('Only citizens can join a city');
    }
    await this.repository.addCitizen(cityId, citizenUser.id);
  }

  async leaveCity(cityId: string, citizenUser: User): Promise<void> {
    if (citizenUser.role !== 'CITIZEN') {
      throw new Error('Only citizens can leave a city');
    }
    await this.repository.removeCitizen(cityId, citizenUser.id);
  }

  async assignEmployee(cityId: string, userId: number): Promise<void> {
    const existingCityId = await this.repository.getEmployeeCityIdByUserId(userId);
    if (existingCityId && existingCityId !== cityId) {
      throw new Error('Employee already assigned to a city');
    }
    await this.repository.addEmployee(cityId, userId);
  }

  async unassignEmployee(cityId: string, userId: number): Promise<void> {
    await this.repository.removeEmployee(cityId, userId);
  }

  async createAndAssignEmployee(cityId: string, input: CreateEmployeeInput): Promise<void> {
    const created = await this.iamService.createUser({
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      realmRoles: ['EMPLOYEE'],
    });

    await this.userService.syncFromHeaders({
      keycloakId: created.id,
      role: 'EMPLOYEE',
      username: created.username,
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
    });

    const dbUser = await this.userService.getByKeycloakId(created.id);
    if (!dbUser) {
      throw new Error('Failed to create employee in DB');
    }

    await this.assignEmployee(cityId, dbUser.id);
  }

  async unassignEmployeeAndDeleteIam(cityId: string, userId: number): Promise<void> {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await this.repository.removeEmployee(cityId, userId);
    await this.iamService.deleteUser(user.keycloakId);
  }

  async listEmployees(cityId: string): Promise<number[]> {
    const employees = await this.repository.listEmployees(cityId);
    return employees.map((e) => e.userId);
  }

  async listCitizens(cityId: string): Promise<number[]> {
    const citizens = await this.repository.listCitizens(cityId);
    return citizens.map((m) => m.userId);
  }

  async getScopedCityForAdminOrEmployee(userId: number): Promise<string | null> {
    const managed = await this.repository.getCityIdManagedByAdminUserId(userId);
    if (managed) {
      return managed;
    }
    return await this.repository.getEmployeeCityIdByUserId(userId);
  }

  async listCitizenMembershipsPublic(userId: number): Promise<CityPublicDto[]> {
    const memberships = await this.repository.listCitizenMembershipsByUserId(userId);
    const results: CityPublicDto[] = [];
    for (const m of memberships) {
      const city = await this.repository.getCityById(m.cityId);
      if (city) {
        results.push(toCityPublicDto(city));
      }
    }
    return results;
  }

  async isCitizenMember(cityId: string, userId: number): Promise<boolean> {
    return await this.repository.isCitizenMember(cityId, userId);
  }

  async isStaffOfCity(cityId: string, userId: number): Promise<boolean> {
    const isAdmin = await this.repository.isAdminOfCity(cityId, userId);
    if (isAdmin) {
      return true;
    }
    return await this.repository.isEmployeeOfCity(cityId, userId);
  }
}
