import type { Article, ArticleLocale, ArticleTranslation, CreateArticleInput } from '@repo/contracts/article';
import { articleMockContent } from '@/modules/article/article.mock';

export class ArticleRepository {
  private articles: Article[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      translations: [
        {
          locale: 'fr',
          title: 'Bienvenue dans notre ville',
          description: 'Découvrez les dernières actualités de notre commune.',
          content: articleMockContent,
        },
        {
          locale: 'en',
          title: 'Welcome to our city',
          description: 'Discover the latest news from our municipality.',
          content: articleMockContent,
        },
      ],
      coverImageUrl: 'https://picsum.photos/seed/city/800/400',
      status: 'published',
      publishedAt: '2026-01-15T10:00:00.000Z',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
      authorId: 'user-municipality-1',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      translations: [
        {
          locale: 'fr',
          title: 'Travaux de voirie — Rue du Moulin',
          description: 'Informations sur les travaux en cours.',
          content: articleMockContent,
        },
      ],
      coverImageUrl: 'https://picsum.photos/seed/road/800/400',
      status: 'published',
      publishedAt: '2026-01-20T09:00:00.000Z',
      createdAt: '2026-01-18T14:00:00.000Z',
      updatedAt: '2026-01-20T09:00:00.000Z',
      authorId: 'user-municipality-1',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      translations: [
        {
          locale: 'fr',
          title: 'Conseil municipal — Compte-rendu de janvier',
          description: 'Résumé des décisions prises lors du conseil du 25 janvier.',
          content: articleMockContent,
        },
        {
          locale: 'de',
          title: 'Gemeinderat — Bericht Januar',
          description: 'Zusammenfassung der Beschlüsse der Sitzung vom 25. Januar.',
          content: articleMockContent,
        },
      ],
      status: 'published',
      publishedAt: '2026-01-26T11:00:00.000Z',
      createdAt: '2026-01-26T10:00:00.000Z',
      updatedAt: '2026-01-26T11:00:00.000Z',
      authorId: 'user-municipality-2',
    },
  ];

  findAll(): Article[] {
    return this.articles;
  }

  findAllPublished(): Article[] {
    return this.articles.filter((a) => a.status === 'published');
  }

  findById(id: string): Article | undefined {
    return this.articles.find((a) => a.id === id);
  }

  create(input: CreateArticleInput & { id: string; authorId: string; createdAt: string; updatedAt: string }): Article {
    const article: Article = {
      id: input.id,
      translations: [input.translation],
      coverImageUrl: input.coverImageUrl,
      status: input.status ?? 'draft',
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      authorId: input.authorId,
    };
    this.articles.push(article);
    return article;
  }

  update(id: string, input: Partial<Article>): Article | undefined {
    const index = this.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return undefined;
    }
    const updated = { ...this.articles[index], ...input } as Article;
    this.articles[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = this.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return false;
    }
    this.articles.splice(index, 1);
    return true;
  }

  addTranslation(id: string, translation: ArticleTranslation): Article | undefined {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      return undefined;
    }
    article.translations.push(translation);
    return article;
  }

  updateTranslation(id: string, locale: ArticleLocale, translation: Partial<ArticleTranslation>): Article | undefined {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      return undefined;
    }
    const tIndex = article.translations.findIndex((t) => t.locale === locale);
    if (tIndex === -1) {
      return undefined;
    }
    article.translations[tIndex] = { ...article.translations[tIndex], ...translation } as ArticleTranslation;
    return article;
  }

  deleteTranslation(id: string, locale: ArticleLocale): Article | undefined {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      return undefined;
    }
    article.translations = article.translations.filter((t) => t.locale !== locale);
    return article;
  }
}
