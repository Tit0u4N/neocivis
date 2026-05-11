import type { CityPublicDto } from '@repo/contracts/city';

export type City = Readonly<{
  id: string;
  name: string;
  description: string;
  adminUserId: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CityEmployee = Readonly<{
  cityId: string;
  userId: number;
  createdAt: Date;
}>;

export type CityCitizenMembership = Readonly<{
  cityId: string;
  userId: number;
  createdAt: Date;
}>;

export function toCityPublicDto(city: Pick<City, 'id' | 'name' | 'description'>): CityPublicDto {
  return { id: city.id, name: city.name, description: city.description };
}

