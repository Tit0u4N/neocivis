import type { CreateEstablishmentInput, Establishment, UpdateEstablishmentInput } from '@repo/contracts/establishment';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class EstablishmentService extends AbstractService {
  constructor(kyInstance: KyInstance, cityId: string) {
    super(kyInstance, { cityId });
  }

  async getAll(): Promise<Establishment[]> {
    return await this.http.get('establishment/all').json<Establishment[]>();
  }

  async getById(id: string): Promise<Establishment> {
    return await this.http.get(`establishment/${id}`).json<Establishment>();
  }

  async create(input: CreateEstablishmentInput): Promise<Establishment> {
    return await this.http.post('establishment', { json: input }).json<Establishment>();
  }

  async update(id: string, input: UpdateEstablishmentInput): Promise<Establishment> {
    return await this.http.put(`establishment/${id}`, { json: input }).json<Establishment>();
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`establishment/${id}`);
  }
}
