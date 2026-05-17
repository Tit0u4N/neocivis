import type { MediaImage } from '@repo/contracts/media';

export interface IMediaRepository {
  findAll(): Promise<MediaImage[]>;
  findByCityId(cityId: string): Promise<MediaImage[]>;
  findById(id: string): Promise<MediaImage | undefined>;
  create(media: MediaImage): Promise<MediaImage>;
  delete(id: string): Promise<boolean>;
}
