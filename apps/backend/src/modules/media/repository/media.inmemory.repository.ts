import type { MediaImage } from '@repo/contracts/media';
import type { IMediaRepository } from './media.repository.interface';

export class InMemoryMediaRepository implements IMediaRepository {
  private items: MediaImage[] = [];

  findAll(): Promise<MediaImage[]> {
    return Promise.resolve([...this.items]);
  }

  findByCityId(cityId: string): Promise<MediaImage[]> {
    return Promise.resolve(this.items.filter((m) => m.cityId === cityId));
  }

  findById(id: string): Promise<MediaImage | undefined> {
    return Promise.resolve(this.items.find((m) => m.id === id));
  }

  findByIdAndCityId(id: string, cityId: string): Promise<MediaImage | undefined> {
    return Promise.resolve(this.items.find((m) => m.id === id && m.cityId === cityId));
  }

  create(media: MediaImage): Promise<MediaImage> {
    this.items.push(media);
    return Promise.resolve(media);
  }

  update(id: string, input: Partial<MediaImage>): Promise<MediaImage | undefined> {
    const index = this.items.findIndex((m) => m.id === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const updated = { ...this.items[index], ...input, id } as MediaImage;
    this.items[index] = updated;
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<boolean> {
    const index = this.items.findIndex((m) => m.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    this.items.splice(index, 1);
    return Promise.resolve(true);
  }
}
