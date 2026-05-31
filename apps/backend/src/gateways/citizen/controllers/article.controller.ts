import type { ApiErrorDto } from '@repo/contracts';
import {
  ArticleLocale,
  ArticlesListQuery,
  type ArticleWithResolvedTranslation,
  type PaginatedArticlesResponse,
} from '@repo/contracts/article';
import { type Context, Hono } from 'hono';
import { z } from 'zod';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ArticleService } from '@/modules/article/service/article.service';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/', (c) => this.listPublishedArticles(c));
    app.get('/:id', (c) => this.getPublishedArticleById(c));

    return app;
  }

  private async listPublishedArticles(c: Context): Promise<ControllerJson<PaginatedArticlesResponse>> {
    const cityId = c.req.param('cityId');
    const result = ArticlesListQuery.safeParse({
      preferredLocale: c.req.query('preferredLocale'),
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    });

    if (!result.success) {
      return c.json({ error: 'Invalid query parameters' } satisfies ApiErrorDto, 400);
    }

    const { preferredLocale, page, limit } = result.data;

    const body: PaginatedArticlesResponse = await this.articleService.getPublishedByCityPaginated(
      cityId,
      page,
      limit,
      preferredLocale,
    );
    return c.json(body, 200);
  }

  private async getPublishedArticleById(c: Context): Promise<ControllerJson<ArticleWithResolvedTranslation>> {
    const cityId = c.req.param('cityId');
    const localeResult = z
      .object({ preferredLocale: ArticleLocale.optional().default('fr') })
      .safeParse({ preferredLocale: c.req.query('preferredLocale') });

    const preferredLocale = localeResult.success ? localeResult.data.preferredLocale : 'fr';

    try {
      const article = await this.articleService.getPublishedArticleByIdAndCity(
        cityId,
        c.req.param('id'),
        preferredLocale,
      );
      const body: ArticleWithResolvedTranslation = article;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Article not found' } satisfies ApiErrorDto, 404);
    }
  }
}
