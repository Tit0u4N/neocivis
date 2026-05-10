import type { City, CityCitizenMembership, CityEmployee } from '../city.types';

export type CreateCityInput = Readonly<{
  id: string;
  name: string;
  description: string;
  adminUserId: number;
}>;

export interface ICityRepository {
  listCities(): Promise<City[]>;
  getCityById(cityId: string): Promise<City | null>;
  createCity(input: CreateCityInput): Promise<City>;
  updateCityDescription(cityId: string, description: string): Promise<City>;

  listEmployees(cityId: string): Promise<CityEmployee[]>;
  addEmployee(cityId: string, userId: number): Promise<void>;
  removeEmployee(cityId: string, userId: number): Promise<void>;
  getEmployeeCityIdByUserId(userId: number): Promise<string | null>;
  isEmployeeOfCity(cityId: string, userId: number): Promise<boolean>;

  listCitizens(cityId: string): Promise<CityCitizenMembership[]>;
  addCitizen(cityId: string, userId: number): Promise<void>;
  removeCitizen(cityId: string, userId: number): Promise<void>;
  listCitizenMembershipsByUserId(userId: number): Promise<CityCitizenMembership[]>;
  isCitizenMember(cityId: string, userId: number): Promise<boolean>;

  getCityIdManagedByAdminUserId(userId: number): Promise<string | null>;
  isAdminOfCity(cityId: string, userId: number): Promise<boolean>;

  deleteAll(): Promise<void>;
}

