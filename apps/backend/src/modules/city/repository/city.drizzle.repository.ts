import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import { cityCitizens, cityEmployees, cities } from './city.table';
import type { CreateCityInput, ICityRepository } from './city.repository.interface';
import type { City, CityCitizenMembership, CityEmployee } from '../city.types';

function mapCityRow(r: typeof cities.$inferSelect): City {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    adminUserId: r.adminUserId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function mapEmployeeRow(r: typeof cityEmployees.$inferSelect): CityEmployee {
  return { cityId: r.cityId, userId: r.userId, createdAt: r.createdAt };
}

function mapCitizenRow(r: typeof cityCitizens.$inferSelect): CityCitizenMembership {
  return { cityId: r.cityId, userId: r.userId, createdAt: r.createdAt };
}

export class DrizzleCityRepository implements ICityRepository {
  async listCities(): Promise<City[]> {
    const db = getDb();
    const rows = await db.select().from(cities);
    return rows.map(mapCityRow);
  }

  async getCityById(cityId: string): Promise<City | null> {
    const db = getDb();
    const rows = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    const r = rows[0];
    return r ? mapCityRow(r) : null;
  }

  async createCity(input: CreateCityInput): Promise<City> {
    const db = getDb();
    const rows = await db
      .insert(cities)
      .values({ id: input.id, name: input.name, description: input.description, adminUserId: input.adminUserId })
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error('Failed to insert city');
    }
    return mapCityRow(r);
  }

  async updateCityDescription(cityId: string, description: string): Promise<City> {
    const db = getDb();
    const rows = await db
      .update(cities)
      .set({ description, updatedAt: sql`now()` })
      .where(eq(cities.id, cityId))
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error(`City not found: ${cityId}`);
    }
    return mapCityRow(r);
  }

  async listEmployees(cityId: string): Promise<CityEmployee[]> {
    const db = getDb();
    const rows = await db.select().from(cityEmployees).where(eq(cityEmployees.cityId, cityId));
    return rows.map(mapEmployeeRow);
  }

  async addEmployee(cityId: string, userId: number): Promise<void> {
    const db = getDb();
    await db.insert(cityEmployees).values({ cityId, userId });
  }

  async removeEmployee(cityId: string, userId: number): Promise<void> {
    const db = getDb();
    await db.delete(cityEmployees).where(and(eq(cityEmployees.cityId, cityId), eq(cityEmployees.userId, userId)));
  }

  async getEmployeeCityIdByUserId(userId: number): Promise<string | null> {
    const db = getDb();
    const rows = await db.select({ cityId: cityEmployees.cityId }).from(cityEmployees).where(eq(cityEmployees.userId, userId));
    const r = rows[0];
    return r?.cityId ?? null;
  }

  async isEmployeeOfCity(cityId: string, userId: number): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select({ userId: cityEmployees.userId })
      .from(cityEmployees)
      .where(and(eq(cityEmployees.cityId, cityId), eq(cityEmployees.userId, userId)))
      .limit(1);
    return rows.length > 0;
  }

  async listCitizens(cityId: string): Promise<CityCitizenMembership[]> {
    const db = getDb();
    const rows = await db.select().from(cityCitizens).where(eq(cityCitizens.cityId, cityId));
    return rows.map(mapCitizenRow);
  }

  async addCitizen(cityId: string, userId: number): Promise<void> {
    const db = getDb();
    await db.insert(cityCitizens).values({ cityId, userId });
  }

  async removeCitizen(cityId: string, userId: number): Promise<void> {
    const db = getDb();
    await db.delete(cityCitizens).where(and(eq(cityCitizens.cityId, cityId), eq(cityCitizens.userId, userId)));
  }

  async listCitizenMembershipsByUserId(userId: number): Promise<CityCitizenMembership[]> {
    const db = getDb();
    const rows = await db.select().from(cityCitizens).where(eq(cityCitizens.userId, userId));
    return rows.map(mapCitizenRow);
  }

  async isCitizenMember(cityId: string, userId: number): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select({ userId: cityCitizens.userId })
      .from(cityCitizens)
      .where(and(eq(cityCitizens.cityId, cityId), eq(cityCitizens.userId, userId)))
      .limit(1);
    return rows.length > 0;
  }

  async getCityIdManagedByAdminUserId(userId: number): Promise<string | null> {
    const db = getDb();
    const rows = await db.select({ cityId: cities.id }).from(cities).where(eq(cities.adminUserId, userId)).limit(1);
    const r = rows[0];
    return r?.cityId ?? null;
  }

  async isAdminOfCity(cityId: string, userId: number): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select({ cityId: cities.id })
      .from(cities)
      .where(and(eq(cities.id, cityId), eq(cities.adminUserId, userId)))
      .limit(1);
    return rows.length > 0;
  }

  async deleteAll(): Promise<void> {
    const db = getDb();
    await db.delete(cityCitizens);
    await db.delete(cityEmployees);
    await db.delete(cities);
  }
}

