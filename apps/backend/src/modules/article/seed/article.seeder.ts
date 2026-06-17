import { randomUUID } from 'node:crypto';
import type { ArticleTranslation } from '@repo/contracts';
import type { ISeeder } from '@/core/seeder.interface';
import type { CityService } from '@/modules/city/city.service';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { NICE_MEDIA_IDS } from '@/modules/media/seed/media.seed';
import type { MediaLinkService } from '@/modules/media/service/media-link.service';
import { MediaLinkService as MediaLinkServiceClass } from '@/modules/media/service/media-link.service';
import type { IArticleRepository } from '../repository/article.repository.interface';
import { type ArticleSeedTemplate, loadSeededArticlesDev } from './article.seed';

const OTHER_CITY_NAMES = ['Biot', 'Marseille'] as const;

const NICE_ARTICLE_MEDIA: Record<string, { coverMediaId?: string; inlineMediaId?: string }> = {
  '11111111-1111-1111-1111-111111111111': {
    coverMediaId: NICE_MEDIA_IDS.articleCover1,
    inlineMediaId: NICE_MEDIA_IDS.articleInline,
  },
  '22222222-2222-2222-2222-222222222222': {
    coverMediaId: NICE_MEDIA_IDS.articleCover2,
  },
};

function pickRandomCount(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandomSubset<T>(items: readonly T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function replaceInlineImageUrl(content: unknown, imageUrl: string): unknown {
  if (!Array.isArray(content)) {
    return content;
  }
  return content.map((node) => {
    if (!node || typeof node !== 'object') {
      return node;
    }
    const record = node as Record<string, unknown>;
    if (record.type === 'img' && typeof record.url === 'string') {
      return { ...record, url: imageUrl };
    }
    if (Array.isArray(record.children)) {
      return { ...record, children: replaceInlineImageUrl(record.children, imageUrl) };
    }
    return node;
  });
}

export class ArticleSeeder implements ISeeder {
  private readonly mediaLinkService?: MediaLinkService;
  private readonly mediaRepository?: IMediaRepository;

  constructor(
    private articleRepository: IArticleRepository,
    private cityService: CityService,
    mediaRepository?: IMediaRepository,
  ) {
    this.mediaRepository = mediaRepository;
    this.mediaLinkService = mediaRepository ? new MediaLinkServiceClass(mediaRepository) : undefined;
  }

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
      for (const template of templates) {
        const article = await this.applyNiceMedia(template, nice.id);
        await this.upsertArticle(article);
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

  private async applyNiceMedia(
    template: ArticleSeedTemplate,
    cityId: string,
  ): Promise<ArticleSeedTemplate & { cityId: string }> {
    if (!this.mediaRepository) {
      return { ...template, cityId };
    }
    const mapping = NICE_ARTICLE_MEDIA[template.id];
    let coverImageUrl = template.coverImageUrl;
    let translations = template.translations;

    if (mapping?.coverMediaId) {
      const media = await this.mediaRepository.findById(mapping.coverMediaId);
      if (media) {
        coverImageUrl = media.url;
      }
    }

    if (mapping?.inlineMediaId) {
      const media = await this.mediaRepository.findById(mapping.inlineMediaId);
      if (media) {
        translations = template.translations.map((t) => ({
          ...t,
          content: replaceInlineImageUrl(t.content, media.url),
        }));
      }
    }

    return { ...template, cityId, coverImageUrl, translations };
  }

  private async upsertArticle(article: ArticleSeedTemplate & { cityId: string }): Promise<void> {
    const existing = await this.articleRepository.findById(article.id);
    if (existing) {
      await this.articleRepository.update(article.id, article);
    } else {
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

    const saved = await this.articleRepository.findById(article.id);
    if (saved) {
      await this.mediaLinkService?.syncArticleMediaLinks(saved);
    }
  }

  private getBaseTranslation(translations: ArticleTranslation[]): ArticleTranslation {
    return translations.find((t) => t.locale === 'fr') ?? translations[0];
  }
}
