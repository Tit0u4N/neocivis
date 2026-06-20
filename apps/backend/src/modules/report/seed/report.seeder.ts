import { randomUUID } from 'node:crypto';
import { isInMemoryMode } from '@/core/runtime-config';
import type { ISeeder } from '@/core/seeder.interface';
import { getCachedImageBuffer } from '@/infrastructure/media/image-seed-cache';
import type { CityService } from '@/modules/city/city.service';
import type { IMediaBlobService } from '@/modules/media/media-blob.service';
import type { IReportRepository } from '../repository/report.repository.interface';
import { REPORT_SEED_TEMPLATES } from './report.seed';

export class ReportSeeder implements ISeeder {
  constructor(
    private readonly repository: IReportRepository,
    private readonly cityService: CityService,
    private readonly blobService?: IMediaBlobService,
  ) {}

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    for (const city of cities) {
      await this.seedCity(city.id);
    }
  }

  private async seedCity(cityId: string): Promise<void> {
    const { total } = await this.repository.findByCityId(cityId, 1, 1);
    if (total > 0) {
      return;
    }
    for (const template of REPORT_SEED_TEMPLATES) {
      const photoUrl = await this.resolvePhotoUrl(cityId, template.id, template.photoUrl);
      await this.repository.create({
        id: randomUUID(),
        authorId: template.authorSeedId.toString(),
        cityId,
        title: template.title,
        type: template.type,
        status: template.status,
        desc: template.desc,
        photoUrl,
        location: template.location,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        resolvedAt: template.resolvedAt,
      });
    }
  }

  private async resolvePhotoUrl(cityId: string, templateId: string, sourceUrl: string): Promise<string> {
    if (isInMemoryMode() || !this.blobService) {
      return sourceUrl;
    }
    const storagePath = `${cityId}/seed/reports/${templateId}.jpg`;
    const buffer = await getCachedImageBuffer(sourceUrl, `report-seed-${templateId}`);
    const uploaded = await this.blobService.uploadToStoragePath(buffer, 'image/jpeg', storagePath);
    // biome-ignore lint/suspicious/noConsole: seeding diagnostics
    console.info(`[report-seed] uploaded ${storagePath} (${buffer.length} bytes) → ${uploaded.url}`);
    return uploaded.url;
  }
}
