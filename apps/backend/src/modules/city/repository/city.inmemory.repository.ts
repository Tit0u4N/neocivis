import type { City, CityCitizenMembership, CityEmployee } from '../city.types';
import type { CreateCityInput, ICityRepository } from './city.repository.interface';

export class InMemoryCityRepository implements ICityRepository {
  private cities: City[] = [];
  private employees: CityEmployee[] = [];
  private citizens: CityCitizenMembership[] = [];

  // biome-ignore lint/suspicious/useAwait: mock file
  async listCities(): Promise<City[]> {
    return [...this.cities];
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async getCityById(cityId: string): Promise<City | null> {
    return this.cities.find((c) => c.id === cityId) ?? null;
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async createCity(input: CreateCityInput): Promise<City> {
    const now = new Date();
    const city: City = {
      id: input.id,
      name: input.name,
      description: input.description,
      adminUserId: input.adminUserId,
      createdAt: now,
      updatedAt: now,
    };
    this.cities.push(city);
    return city;
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async updateCityDescription(cityId: string, description: string): Promise<City> {
    const idx = this.cities.findIndex((c) => c.id === cityId);
    if (idx === -1) {
      throw new Error(`City not found: ${cityId}`);
    }
    const updated: City = { ...this.cities[idx], description, updatedAt: new Date() };
    this.cities[idx] = updated;
    return updated;
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async listEmployees(cityId: string): Promise<CityEmployee[]> {
    return this.employees.filter((e) => e.cityId === cityId);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async addEmployee(cityId: string, userId: number): Promise<void> {
    const exists = this.employees.some((e) => e.cityId === cityId && e.userId === userId);
    if (exists) {
      return;
    }
    const userAlreadyAssigned = this.employees.some((e) => e.userId === userId && e.cityId !== cityId);
    if (userAlreadyAssigned) {
      throw new Error('Employee already assigned to a city');
    }
    this.employees.push({ cityId, userId, createdAt: new Date() });
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async removeEmployee(cityId: string, userId: number): Promise<void> {
    this.employees = this.employees.filter((e) => !(e.cityId === cityId && e.userId === userId));
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async getEmployeeCityIdByUserId(userId: number): Promise<string | null> {
    return this.employees.find((e) => e.userId === userId)?.cityId ?? null;
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async isEmployeeOfCity(cityId: string, userId: number): Promise<boolean> {
    return this.employees.some((e) => e.cityId === cityId && e.userId === userId);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async listCitizens(cityId: string): Promise<CityCitizenMembership[]> {
    return this.citizens.filter((m) => m.cityId === cityId);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async addCitizen(cityId: string, userId: number): Promise<void> {
    const exists = this.citizens.some((m) => m.cityId === cityId && m.userId === userId);
    if (exists) {
      return;
    }
    this.citizens.push({ cityId, userId, createdAt: new Date() });
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async removeCitizen(cityId: string, userId: number): Promise<void> {
    this.citizens = this.citizens.filter((m) => !(m.cityId === cityId && m.userId === userId));
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async listCitizenMembershipsByUserId(userId: number): Promise<CityCitizenMembership[]> {
    return this.citizens.filter((m) => m.userId === userId);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async isCitizenMember(cityId: string, userId: number): Promise<boolean> {
    return this.citizens.some((m) => m.cityId === cityId && m.userId === userId);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async getCityIdManagedByAdminUserId(userId: number): Promise<string | null> {
    return this.cities.find((c) => c.adminUserId === userId)?.id ?? null;
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async isAdminOfCity(cityId: string, userId: number): Promise<boolean> {
    return this.cities.some((c) => c.id === cityId && c.adminUserId === userId);
  }

  // biome-ignore lint/suspicious/useAwait: mock file
  async deleteAll(): Promise<void> {
    this.citizens = [];
    this.employees = [];
    this.cities = [];
  }
}
