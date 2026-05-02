import {
  AddTranslationInput,
  ArticleLocale,
  CreateArticleInput,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import type { Context } from 'hono';
import { Hono } from 'hono';
import type { ArticleService } from '@/modules/article/service/article.service';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  public getRoutes() {
    const app = new Hono();

    app.get('/', async (c: Context) => {
      return c.json(await this.articleService.getAllArticles());
    });

    app.get('/:id', async (c: Context) => {
      try {
        const article = await this.articleService.getArticleById(c.req.param('id'));
        return c.json(article);
      } catch {
        return c.json({ error: 'Article not found' }, 404);
      }
    });

    app.post('/', async (c: Context) => {
      const body = await c.req.json();
      const parsed = CreateArticleInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      const authorId = (c.get('userId') as string) ?? 'unknown';
      const article = await this.articleService.createArticle(parsed.data, authorId);
      return c.json(article, 201);
    });

    app.put('/:id', async (c: Context) => {
      const body = await c.req.json();
      const parsed = UpdateArticleInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      try {
        const article = await this.articleService.updateArticle(c.req.param('id'), parsed.data);
        return c.json(article);
      } catch {
        return c.json({ error: 'Article not found' }, 404);
      }
    });

    app.delete('/:id', async (c: Context) => {
      try {
        await this.articleService.deleteArticle(c.req.param('id'));
        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Article not found' }, 404);
      }
    });

    app.patch('/:id/status', async (c: Context) => {
      const body = await c.req.json();
      const parsed = UpdateStatusInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      try {
        const article = await this.articleService.updateStatus(c.req.param('id'), parsed.data);
        return c.json(article);
      } catch {
        return c.json({ error: 'Article not found' }, 404);
      }
    });

    app.post('/:id/translations', async (c: Context) => {
      const body = await c.req.json();
      const parsed = AddTranslationInput.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      try {
        const article = await this.articleService.addTranslation(c.req.param('id'), parsed.data);
        return c.json(article, 201);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message.includes('not found')) {
          return c.json({ error: message }, 404);
        }
        return c.json({ error: message }, 409);
      }
    });

    app.put('/:id/translations/:locale', async (c: Context) => {
      const localeParsed = ArticleLocale.safeParse(c.req.param('locale'));
      if (!localeParsed.success) {
        return c.json({ error: 'Invalid locale' }, 400);
      }
      const body = await c.req.json();
      const parsed = AddTranslationInput.partial().safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.message }, 400);
      }
      try {
        const article = await this.articleService.updateTranslation(c.req.param('id'), localeParsed.data, parsed.data);
        return c.json(article);
      } catch {
        return c.json({ error: 'Translation not found' }, 404);
      }
    });

    app.delete('/:id/translations/:locale', async (c: Context) => {
      const localeParsed = ArticleLocale.safeParse(c.req.param('locale'));
      if (!localeParsed.success) {
        return c.json({ error: 'Invalid locale' }, 400);
      }
      try {
        const article = await this.articleService.deleteTranslation(c.req.param('id'), localeParsed.data);
        return c.json(article);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message.includes('Cannot delete')) {
          return c.json({ error: message }, 403);
        }
        return c.json({ error: message }, 404);
      }
    });

    return app;
  }
}
