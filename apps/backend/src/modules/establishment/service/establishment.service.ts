import { randomUUID } from 'node:crypto';
import type { CreateEstablishmentInput, Establishment, UpdateEstablishmentInput } from '@repo/contracts/establishment';
import type { MediaLinkService } from '@/modules/media/service/media-link.service';
import type { EstablishmentEntity } from '../establishment.types';
import type { IEstablishmentRepository } from '../repository/establishment.repository.interface';

function toDto(entity: EstablishmentEntity): Establishment {
  const { cityId: _, ...dto } = entity;
  return dto;
}

export class EstablishmentService {
  constructor(
    private readonly repository: IEstablishmentRepository,
    private readonly mediaLinkService?: MediaLinkService,
  ) {}

  async list(cityId: string): Promise<Establishment[]> {
    const entities = await this.repository.listByCityId(cityId);
    return entities.map(toDto);
  }

  async getById(cityId: string, id: string): Promise<Establishment | undefined> {
    const entity = await this.repository.getByIdAndCityId(id, cityId);
    return entity ? toDto(entity) : undefined;
  }

  async create(cityId: string, data: CreateEstablishmentInput): Promise<Establishment> {
    const entity = await this.repository.create({ id: randomUUID(), cityId, ...data });
    await this.mediaLinkService?.syncEstablishmentMediaLinks(entity);
    return toDto(entity);
  }

  async update(cityId: string, id: string, data: UpdateEstablishmentInput): Promise<Establishment | undefined> {
    const existing = await this.repository.getByIdAndCityId(id, cityId);
    if (!existing) {
      return undefined;
    }
    const entity = await this.repository.update(id, data);
    if (entity) {
      await this.mediaLinkService?.syncEstablishmentMediaLinks(entity);
    }
    return entity ? toDto(entity) : undefined;
  }

  async delete(cityId: string, id: string): Promise<boolean> {
    const existing = await this.repository.getByIdAndCityId(id, cityId);
    if (!existing) {
      return false;
    }
    await this.mediaLinkService?.removeEstablishmentMediaLinks(cityId, id);
    return this.repository.delete(id);
  }
}
