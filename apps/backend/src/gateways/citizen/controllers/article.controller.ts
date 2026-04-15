import type { Context } from 'hono';
import { Hono } from 'hono';
import type { ArticleService } from '../../../modules/article/article.service';

export class ArticleController {
  constructor(private service: ArticleService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/', async (c: Context) => {
      return c.json(await this.service.getPublishedArticles());
    });

    app.get('/:id', async (c: Context) => {
      try {
        const article = await this.service.getArticleById(c.req.param('id'));
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
