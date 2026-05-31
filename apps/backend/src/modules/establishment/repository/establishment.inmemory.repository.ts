// biome-ignore-all lint/suspicious/useAwait: mock file

import type { EstablishmentEntity } from '../establishment.types';
import type { IEstablishmentRepository } from './establishment.repository.interface';

export class InMemoryEstablishmentRepository implements IEstablishmentRepository {
  private establishments: EstablishmentEntity[] = [];

  async listByCityId(cityId: string): Promise<EstablishmentEntity[]> {
    return this.establishments.filter((e) => e.cityId === cityId);
  }

  async getByIdAndCityId(id: string, cityId: string): Promise<EstablishmentEntity | undefined> {
    return this.establishments.find((e) => e.id === id && e.cityId === cityId);
  }

  async create(data: EstablishmentEntity): Promise<EstablishmentEntity> {
    this.establishments.push(data);
    return data;
  }

  async update(
    id: string,
    data: Partial<Omit<EstablishmentEntity, 'id' | 'cityId'>>,
  ): Promise<EstablishmentEntity | undefined> {
    const index = this.establishments.findIndex((e) => e.id === id);
    if (index === -1) {
      return undefined;
    }
    this.establishments[index] = { ...this.establishments[index], ...data };
    return this.establishments[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.establishments.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    this.establishments.splice(index, 1);
    return true;
  }

  async deleteAll(): Promise<void> {
    this.establishments = [];
  }
}
