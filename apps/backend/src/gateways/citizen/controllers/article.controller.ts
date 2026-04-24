import { ArticleLocale, ArticlesListQuery } from '@repo/contracts/article';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { z } from 'zod';
import type { ArticleService } from '@/modules/article/article.service';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/', async (c: Context) => {
      const result = ArticlesListQuery.safeParse({
        preferredLocale: c.req.query('preferredLocale'),
        page: c.req.query('page'),
        limit: c.req.query('limit'),
      });

      if (!result.success) {
        return c.json({ error: 'Invalid query parameters' }, 400);
      }

      const { preferredLocale, page, limit } = result.data;

      return c.json(await this.articleService.getPublishedArticlesPaginated(page, limit, preferredLocale));
    });

    app.get('/:id', async (c: Context) => {
      const localeResult = z
        .object({ preferredLocale: ArticleLocale.optional().default('fr') })
        .safeParse({ preferredLocale: c.req.query('preferredLocale') });

      const preferredLocale = localeResult.success ? localeResult.data.preferredLocale : 'fr';

      try {
        const article = await this.articleService.getArticleByIdResolved(c.req.param('id'), preferredLocale);
        if (article.status !== 'published') {
          return c.json({ error: 'Article not found' }, 404);
        }
        return c.json(article);
      } catch {
        return c.json({ error: 'Article not found' }, 404);
      }
    });

    return app;
  }
}
