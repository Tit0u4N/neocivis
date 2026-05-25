import type { MediaImage } from '@repo/contracts/media';
import { isInMemoryMode } from '@/core/runtime-config';
import type { ISeeder } from '@/core/seeder.interface';
import { getCachedImageBuffer } from '@/infrastructure/media/image-seed-cache';
import type { CityService } from '@/modules/city/city.service';
import type { IMediaBlobService } from '../media-blob.service';
import type { IMediaRepository } from '../repository/media.repository.interface';
import { type MediaSeedTemplate, mediaSeedsByCityName } from './media.seed';

export class MediaSeeder implements ISeeder {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly cityService: CityService,
    private readonly blobService: IMediaBlobService,
  ) {}

  async deleteAll(): Promise<void> {
    const all = await this.mediaRepository.findAll();
    for (const media of all) {
      await this.blobService.deleteByStoragePath(media.storagePath);
      await this.mediaRepository.delete(media.id);
    }
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      const templates = mediaSeedsByCityName.get(city.name);
      if (!templates) {
        continue;
      }
      for (const template of templates) {
        const media = await this.buildMedia(city.id, template);
        const existing = await this.mediaRepository.findById(template.id);
        if (existing) {
          await this.mediaRepository.update(template.id, media);
        } else {
          await this.mediaRepository.create(media);
        }
      }
    }
  }

  private async buildMedia(cityId: string, template: MediaSeedTemplate): Promise<MediaImage> {
    const storagePath = `${cityId}/seed/${template.filename}`;

    if (isInMemoryMode()) {
      return {
        id: template.id,
        title: template.title,
        url: template.sourceUrl,
        storagePath,
        cityId,
        createdAt: new Date().toISOString(),
        links: template.links ?? [],
      };
    }

    const buffer = await getCachedImageBuffer(template.sourceUrl, `${template.id}-${template.sourceUrl}`);
    const uploaded = await this.blobService.uploadToStoragePath(buffer, template.mimeType, storagePath);
    // biome-ignore lint/suspicious/noConsole: seeding diagnostics
    console.info(`[media-seed] uploaded ${storagePath} (${buffer.length} bytes) → ${uploaded.url}`);

    return {
      id: template.id,
      title: template.title,
      url: uploaded.url,
      storagePath: uploaded.storagePath,
      cityId,
      createdAt: new Date().toISOString(),
      links: template.links ?? [],
    };
  }
}
