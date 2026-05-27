import type { Establishment } from '@repo/contracts/establishment';
import type { IEstablishmentRepository } from '../repository/establishment.repository.interface';

export class EstablishmentService {
  constructor(private readonly repository: IEstablishmentRepository) {}

  list(_cityId: string): Promise<Establishment[]> {
    return this.repository.list();
  }

  getById(_cityId: string, id: string): Promise<Establishment | undefined> {
    return this.repository.getById(id);
  }

  create(_cityId: string, data: Omit<Establishment, 'id'>): Promise<Establishment> {
    return this.repository.create(data);
  }

  update(_cityId: string, id: string, data: Partial<Omit<Establishment, 'id'>>): Promise<Establishment | undefined> {
    return this.repository.update(id, data);
  }

  delete(_cityId: string, id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
