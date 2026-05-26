import type { MediaImage, MediaImageLink } from '@repo/contracts/media';

export interface IMediaRepository {
  findAll(): Promise<MediaImage[]>;
  findByCityId(cityId: string): Promise<MediaImage[]>;
  findById(id: string): Promise<MediaImage | undefined>;
  findByIdAndCityId(id: string, cityId: string): Promise<MediaImage | undefined>;
  create(media: MediaImage): Promise<MediaImage>;
  update(id: string, input: Partial<MediaImage>): Promise<MediaImage | undefined>;
  delete(id: string): Promise<boolean>;
}

export function appendMediaLink(existing: MediaImageLink[], link: MediaImageLink): MediaImageLink[] {
  const duplicate = existing.some((l) => l.idLink === link.idLink && l.type === link.type);
  if (duplicate) {
    return existing;
  }
  return [...existing, link];
}
