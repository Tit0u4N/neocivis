import type { Establishment } from '@repo/contracts/establishment';
import type { EstablishmentRepository } from './establishment.repository';

export class EstablishmentService {
  constructor(private repository: EstablishmentRepository) {}

  list(): Establishment[] {
    return this.repository.list();
  }

  getById(id: string): Establishment | undefined {
    return this.repository.getById(id);
  }

  create(data: Omit<Establishment, 'id'>): Establishment {
    return this.repository.create(data);
  }

  update(id: string, data: Partial<Omit<Establishment, 'id'>>): Establishment | undefined {
    return this.repository.update(id, data);
  }

  delete(id: string): boolean {
    return this.repository.delete(id);
  }
}
