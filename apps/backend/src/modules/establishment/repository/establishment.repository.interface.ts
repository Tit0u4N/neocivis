import type { Establishment } from '@repo/contracts/establishment';

export interface IEstablishmentRepository {
  list(): Promise<Establishment[]>;
  getById(id: string): Promise<Establishment | undefined>;
  create(data: Omit<Establishment, 'id'>): Promise<Establishment>;
  update(id: string, data: Partial<Omit<Establishment, 'id'>>): Promise<Establishment | undefined>;
  delete(id: string): Promise<boolean>;
}
