import { randomUUID } from 'node:crypto';
import type { ArticleTranslation } from '@repo/contracts';
import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IArticleRepository } from '../repository/article.repository.interface';
import { type ArticleSeedTemplate, loadSeededArticlesDev } from './article.seed';

const OTHER_CITY_NAMES = ['Biot', 'Marseille'] as const;

function pickRandomCount(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandomSubset<T>(items: readonly T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export class ArticleSeeder implements ISeeder {
  constructor(
    private articleRepository: IArticleRepository,
    private cityService: CityService,
  ) {}

  async deleteAll(): Promise<void> {
    const existing = await this.articleRepository.findAll();
    for (const a of existing) {
      await this.articleRepository.delete(a.id);
    }
  }

  async seed(): Promise<void> {
    const cities = await this.cityService.listPublicCities();
    const templates = loadSeededArticlesDev();
    if (templates.length === 0) {
      return;
    }

    const nice = cities.find((c) => c.name === 'Nice');
    if (nice) {
      for (const article of templates) {
        await this.upsertArticle({ ...article, cityId: nice.id });
      }
    }

    for (const cityName of OTHER_CITY_NAMES) {
      const city = cities.find((c) => c.name === cityName);
      if (!city) {
        continue;
      }
      const count = pickRandomCount(1, 2);
      const subset = pickRandomSubset(templates, count);
      for (const template of subset) {
        await this.upsertArticle({
          ...template,
          id: randomUUID(),
          cityId: city.id,
        });
      }
    }
  }

  private async upsertArticle(article: ArticleSeedTemplate & { cityId: string }): Promise<void> {
    const existing = await this.articleRepository.findById(article.id);
    if (existing) {
      await this.articleRepository.update(article.id, article);
      return;
    }

    const baseTranslation = this.getBaseTranslation(article.translations);
    await this.articleRepository.create({
      id: article.id,
      cityId: article.cityId,
      authorId: article.authorId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      status: article.status,
      coverImageUrl: article.coverImageUrl,
      translation: baseTranslation,
    });
    await this.articleRepository.update(article.id, article);
  }

  private getBaseTranslation(translations: ArticleTranslation[]): ArticleTranslation {
    return translations.find((t) => t.locale === 'fr') ?? translations[0];
  }
}
