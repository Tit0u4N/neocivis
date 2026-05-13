import type { Establishment } from '@repo/contracts/establishment';
import type { IEstablishmentRepository } from './establishment.repository.interface';

export class InMemoryEstablishmentRepository implements IEstablishmentRepository {
  private establishments: Establishment[] = [];

  list(): Promise<Establishment[]> {
    return Promise.resolve(this.establishments);
  }

  getById(id: string): Promise<Establishment | undefined> {
    return Promise.resolve(this.establishments.find((e) => e.id === id));
  }

  create(data: Omit<Establishment, 'id'>): Promise<Establishment> {
    const establishment: Establishment = { ...data, id: crypto.randomUUID() };
    this.establishments.push(establishment);
    return Promise.resolve(establishment);
  }

  update(id: string, data: Partial<Omit<Establishment, 'id'>>): Promise<Establishment | undefined> {
    const index = this.establishments.findIndex((e) => e.id === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    this.establishments[index] = { ...this.establishments[index], ...data };
    return Promise.resolve(this.establishments[index]);
  }

  delete(id: string): Promise<boolean> {
    const index = this.establishments.findIndex((e) => e.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    this.establishments.splice(index, 1);
    return Promise.resolve(true);
  }
}
