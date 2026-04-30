import type { ArticleTranslation } from '@repo/contracts';
import type { AutoSeedMode } from '@/core/runtime-config';
import type { ISeeder } from '@/core/seeder.interface';
import { getMockArticles } from '../article.mock';
import type { IArticleRepository } from '../article.repository';

export class ArticleSeeder implements ISeeder {
  constructor(private articleRepository: IArticleRepository) {}

  async autoSeed(mode: AutoSeedMode): Promise<void> {
    const seeded = getMockArticles();
    if (seeded.length === 0) {
      return;
    }

    if (mode === 'RESET_DATA') {
      await this.deleteAll();
    }

    await this.seed();
  }

  async deleteAll(): Promise<void> {
    const existing = await this.articleRepository.findAll();
    for (const a of existing) {
      await this.articleRepository.delete(a.id);
    }
  }

  async seed(): Promise<void> {
    const articles = getMockArticles();
    for (const article of articles) {
      const existing = await this.articleRepository.findById(article.id);
      if (existing) {
        await this.articleRepository.update(article.id, article);
        continue;
      }

      const baseTranslation = this.getBaseTranslation(article.translations);
      await this.articleRepository.create({
        id: article.id,
        authorId: article.authorId,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        status: article.status,
        coverImageUrl: article.coverImageUrl,
        translation: baseTranslation,
      });
      await this.articleRepository.update(article.id, article);
    }
  }

  private getBaseTranslation(translations: ArticleTranslation[]): ArticleTranslation {
    return translations.find((t) => t.locale === 'fr') ?? translations[0];
  }
}
