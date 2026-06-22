import type { EstablishmentEntity } from '../establishment.types';

export interface IEstablishmentRepository {
  listByCityId(cityId: string): Promise<EstablishmentEntity[]>;
  getByIdAndCityId(id: string, cityId: string): Promise<EstablishmentEntity | undefined>;
  create(data: EstablishmentEntity): Promise<EstablishmentEntity>;
  update(
    id: string,
    data: Partial<Omit<EstablishmentEntity, 'id' | 'cityId'>>,
  ): Promise<EstablishmentEntity | undefined>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
}
