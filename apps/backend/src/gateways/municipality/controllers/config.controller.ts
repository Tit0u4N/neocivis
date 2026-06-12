import type { ApiErrorDto, CarouselItem, Category, MunicipalityConfigResponse } from '@repo/contracts';
import {
  SetCarouselItemsInput as SetCarouselItemsSchema,
  SetCategoriesInput as SetCategoriesSchema,
} from '@repo/contracts';
import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import type { ConfigService } from '@/modules/config/service/config.service';

export class MunicipalityConfigController {
  constructor(private readonly configService: ConfigService) {}

  public getRoutes(): Hono {
    const app = new Hono();

    app.get('/all', (c) => this.getConfig(c));
    app.put('/categories', (c) => this.setCategories(c));
    app.put('/carousel', (c) => this.setCarouselItems(c));

    return app;
  }

  private async getConfig(c: Context): Promise<ControllerJson<MunicipalityConfigResponse, 200, readonly []>> {
    const { cityId } = c.req.param();
    const body: MunicipalityConfigResponse = await this.configService.getMunicipalityConfig(cityId);
    return c.json(body, 200);
  }

  private async setCategories(c: Context): Promise<ControllerJson<Category[], 200>> {
    const cityId = c.req.param('cityId');
    const bodyJson = await c.req.json();
    const parsed = SetCategoriesSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    const body: Category[] = await this.configService.setCategories(cityId, parsed.data);
    return c.json(body, 200);
  }

  private async setCarouselItems(c: Context): Promise<ControllerJson<CarouselItem[], 200>> {
    const cityId = c.req.param('cityId');
    const bodyJson = await c.req.json();
    const parsed = SetCarouselItemsSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return c.json({ error: parsed.error.message } satisfies ApiErrorDto, 400);
    }
    const body: CarouselItem[] = await this.configService.setCarouselItems(cityId, parsed.data);
    return c.json(body, 200);
  }
}
