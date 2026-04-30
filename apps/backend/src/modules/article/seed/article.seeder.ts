import type { ArticleTranslation } from '@repo/contracts';
import type { ISeeder } from '@/core/seeder.interface';
import type { IArticleRepository } from '../repository/article.repository.interface';
import { loadSeededArticlesDev } from './article.seed';

export class ArticleSeeder implements ISeeder {
  constructor(private articleRepository: IArticleRepository) {}

  async deleteAll(): Promise<void> {
    const existing = await this.articleRepository.findAll();
    for (const a of existing) {
      await this.articleRepository.delete(a.id);
    }
  }

  async seed(): Promise<void> {
    const articles = loadSeededArticlesDev();
    if (articles.length === 0) {
      return;
    }
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
