import type { ApiErrorDto, OperationSuccessDto } from '@repo/contracts';
import {
  AddTranslationInput,
  type Article,
  ArticleLocale,
  CreateArticleInput,
  UpdateArticleInput,
  UpdateStatusInput,
} from '@repo/contracts/article';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ArticleService } from '@/modules/article/service/article.service';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/', (c) => this.listAll(c));
    app.get('/:id', (c) => this.getById(c));
    app.post('/', (c) => this.create(c));
    app.put('/:id', (c) => this.update(c));
    app.delete('/:id', (c) => this.remove(c));
    app.patch('/:id/status', (c) => this.patchStatus(c));
    app.post('/:id/translations', (c) => this.addTranslation(c));
    app.put('/:id/translations/:locale', (c) => this.updateTranslation(c));
    app.delete('/:id/translations/:locale', (c) => this.deleteTranslation(c));

    return app;
  }

  private getCityId(c: Context): string {
    return c.req.param('cityId');
  }

  private async listAll(c: Context): Promise<ControllerJson<Article[], 200, readonly []>> {
    const cityId = this.getCityId(c);
    const body: Article[] = await this.articleService.getAllArticles(cityId);
    return c.json(body, 200);
  }

  private async getById(c: Context): Promise<ControllerJson<Article>> {
    const cityId = this.getCityId(c);
    try {
      const article = await this.articleService.getArticleById(cityId, c.req.param('id'));
      const body: Article = article;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Article not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async create(c: Context): Promise<ControllerJson<Article, 201>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = CreateArticleInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    const authorId = c.var.user?.keycloakId ?? 'unknown';
    const article = await this.articleService.createArticle(cityId, parsed.data, authorId);
    const body: Article = article;
    return c.json(body, 201);
  }

  private async update(c: Context): Promise<ControllerJson<Article>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = UpdateArticleInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const article = await this.articleService.updateArticle(cityId, c.req.param('id'), parsed.data);
      const body: Article = article;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Article not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async remove(c: Context): Promise<ControllerJson<OperationSuccessDto>> {
    const cityId = this.getCityId(c);
    try {
      await this.articleService.deleteArticle(cityId, c.req.param('id'));
      return c.json({ success: true } satisfies OperationSuccessDto, 200);
    } catch {
      return c.json({ error: 'Article not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async patchStatus(c: Context): Promise<ControllerJson<Article>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = UpdateStatusInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const article = await this.articleService.updateStatus(cityId, c.req.param('id'), parsed.data);
      const body: Article = article;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Article not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async addTranslation(c: Context): Promise<ControllerJson<Article, 201>> {
    const cityId = this.getCityId(c);
    const bodyJson = await c.req.json();
    const parsed = AddTranslationInput.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const article = await this.articleService.addTranslation(cityId, c.req.param('id'), parsed.data);
      const body: Article = article;
      return c.json(body, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('not found')) {
        return c.json({ error: message } satisfies ApiErrorDto, 404);
      }
      return c.json({ error: message } satisfies ApiErrorDto, 409);
    }
  }

  private async updateTranslation(c: Context): Promise<ControllerJson<Article>> {
    const cityId = this.getCityId(c);
    const localeParsed = ArticleLocale.safeParse(c.req.param('locale'));
    if (!localeParsed.success) {
      return c.json({ error: 'Invalid locale' } satisfies ApiErrorDto, 400);
    }
    const bodyJson = await c.req.json();
    const parsed = AddTranslationInput.partial().safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    try {
      const article = await this.articleService.updateTranslation(
        cityId,
        c.req.param('id'),
        localeParsed.data,
        parsed.data,
      );
      const body: Article = article;
      return c.json(body, 200);
    } catch {
      return c.json({ error: 'Translation not found' } satisfies ApiErrorDto, 404);
    }
  }

  private async deleteTranslation(c: Context): Promise<ControllerJson<Article>> {
    const cityId = this.getCityId(c);
    const localeParsed = ArticleLocale.safeParse(c.req.param('locale'));
    if (!localeParsed.success) {
      return c.json({ error: 'Invalid locale' } satisfies ApiErrorDto, 400);
    }
    try {
      const article = await this.articleService.deleteTranslation(cityId, c.req.param('id'), localeParsed.data);
      const body: Article = article;
      return c.json(body, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('Cannot delete')) {
        return c.json({ error: message } satisfies ApiErrorDto, 403);
      }
      return c.json({ error: message } satisfies ApiErrorDto, 404);
    }
  }
}
