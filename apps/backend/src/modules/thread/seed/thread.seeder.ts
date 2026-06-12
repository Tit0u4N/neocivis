import { randomUUID } from 'node:crypto';
import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IThreadRepository } from '../repository/thread.repository.interface';
import { THREAD_CATEGORY_TEMPLATES, THREAD_SEED_TEMPLATES } from './thread.seed';

export class ThreadSeeder implements ISeeder {
  constructor(
    private repository: IThreadRepository,
    private cityService: CityService,
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
    // Upsert categories
    const existingCategories = await this.repository.findCategoriesByCityId(cityId);
    const categoryIdByLabel = new Map<string, string>();

    for (const template of THREAD_CATEGORY_TEMPLATES) {
      const existing = existingCategories.find((c) => c.label === template.label && c.emoji === template.emoji);
      if (existing) {
        categoryIdByLabel.set(template.label, existing.id);
        continue;
      }
      const created = await this.repository.createCategory({
        ...template,
        id: randomUUID(),
        cityId,
      });
      categoryIdByLabel.set(template.label, created.id);
    }

    // Upsert threads + replies
    const existingThreads = await this.repository.findThreadsByCityId(cityId);

    for (const template of THREAD_SEED_TEMPLATES) {
      const categoryId = categoryIdByLabel.get(template.categoryLabel);
      if (!categoryId) {
        continue;
      }

      const existing = existingThreads.find((t) => t.title === template.title && t.authorId === template.authorId);

      if (!existing) {
        const thread = await this.repository.createThread({
          id: randomUUID(),
          cityId,
          categoryId,
          authorId: template.authorId,
          title: template.title,
          body: template.body,
          likes: 0,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          deleted: false,
          archived: false,
        });

        for (const reply of template.replies) {
          await this.repository.createMessage({
            id: randomUUID(),
            threadId: thread.id,
            cityId,
            authorId: reply.authorId,
            body: reply.body,
            reactions: reply.reactions ?? [],
            createdAt: new Date(new Date(template.createdAt).getTime() + 10 * 60 * 1000).toISOString(),
            updatedAt: new Date(new Date(template.createdAt).getTime() + 10 * 60 * 1000).toISOString(),
            deleted: false,
          });
        }
      }
    }
  }
}
