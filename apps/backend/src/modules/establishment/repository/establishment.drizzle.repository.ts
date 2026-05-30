import { and, eq } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import type { EstablishmentEntity } from '../establishment.types';
import type { IEstablishmentRepository } from './establishment.repository.interface';
import { establishments } from './establishment.table';

function mapRow(r: typeof establishments.$inferSelect): EstablishmentEntity {
  return {
    id: r.id,
    cityId: r.cityId,
    name: r.name,
    type: r.type as EstablishmentEntity['type'],
    address: r.address,
    hours: r.hours,
    phone: r.phone,
    imageUrl: r.imageUrl ?? undefined,
  };
}

export class DrizzleEstablishmentRepository implements IEstablishmentRepository {
  async listByCityId(cityId: string): Promise<EstablishmentEntity[]> {
    const db = getDb();
    const rows = await db.select().from(establishments).where(eq(establishments.cityId, cityId));
    return rows.map(mapRow);
  }

  async getByIdAndCityId(id: string, cityId: string): Promise<EstablishmentEntity | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(establishments)
      .where(and(eq(establishments.id, id), eq(establishments.cityId, cityId)))
      .limit(1);
    const r = rows[0];
    return r ? mapRow(r) : undefined;
  }

  async create(data: EstablishmentEntity): Promise<EstablishmentEntity> {
    const db = getDb();
    const rows = await db
      .insert(establishments)
      .values({
        id: data.id,
        cityId: data.cityId,
        name: data.name,
        type: data.type,
        address: data.address,
        hours: data.hours,
        phone: data.phone,
        imageUrl: data.imageUrl,
      })
      .returning();
    const r = rows[0];
    if (!r) {
      throw new Error('Failed to insert establishment');
    }
    return mapRow(r);
  }

  async update(
    id: string,
    data: Partial<Omit<EstablishmentEntity, 'id' | 'cityId'>>,
  ): Promise<EstablishmentEntity | undefined> {
    const db = getDb();

    type Patch = Partial<
      Pick<typeof establishments.$inferInsert, 'name' | 'type' | 'address' | 'hours' | 'phone' | 'imageUrl'>
    >;
    const patch: Patch = {};
    if (data.name !== undefined) {
      patch.name = data.name;
    }
    if (data.type !== undefined) {
      patch.type = data.type;
    }
    if (data.address !== undefined) {
      patch.address = data.address;
    }
    if (data.hours !== undefined) {
      patch.hours = data.hours;
    }
    if (data.phone !== undefined) {
      patch.phone = data.phone;
    }
    if ('imageUrl' in data) {
      patch.imageUrl = data.imageUrl;
    }

    if (Object.keys(patch).length === 0) {
      const rows = await db.select().from(establishments).where(eq(establishments.id, id)).limit(1);
      const r = rows[0];
      return r ? mapRow(r) : undefined;
    }

    const rows = await db.update(establishments).set(patch).where(eq(establishments.id, id)).returning();
    const r = rows[0];
    return r ? mapRow(r) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db.delete(establishments).where(eq(establishments.id, id)).returning({ id: establishments.id });
    return rows.length > 0;
  }

  async deleteAll(): Promise<void> {
    const db = getDb();
    await db.delete(establishments);
  }
}
