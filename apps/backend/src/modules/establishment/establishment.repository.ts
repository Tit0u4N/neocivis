import type { Establishment } from '@repo/contracts/establishment';
import { getMockEstablishments } from './establishment.mock';

export class EstablishmentRepository {
  private seeded = false;
  private establishments: Establishment[] = [];

  private ensureSeeded(): void {
    if (this.seeded) {
      return;
    }
    this.establishments = getMockEstablishments();
    this.seeded = true;
  }

  list(): Establishment[] {
    this.ensureSeeded();
    return this.establishments;
  }

  getById(id: string): Establishment | undefined {
    this.ensureSeeded();
    return this.establishments.find((e) => e.id === id);
  }

  create(data: Omit<Establishment, 'id'>): Establishment {
    this.ensureSeeded();
    const establishment: Establishment = { ...data, id: `est-${Date.now()}` };
    this.establishments.push(establishment);
    return establishment;
  }

  update(id: string, data: Partial<Omit<Establishment, 'id'>>): Establishment | undefined {
    this.ensureSeeded();
    const index = this.establishments.findIndex((e) => e.id === id);
    if (index === -1) {
      return undefined;
    }
    this.establishments[index] = { ...this.establishments[index], ...data };
    return this.establishments[index];
  }

  delete(id: string): boolean {
    this.ensureSeeded();
    const index = this.establishments.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    this.establishments.splice(index, 1);
    return true;
  }
}
