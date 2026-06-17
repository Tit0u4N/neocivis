import { type Context, Hono } from 'hono';
import type { ControllerJson } from '@/gateways/controller-json-response';
import { parseKeycloakWebhookEvent } from '@/modules/webhook/keycloak-webhook.schema';
import type { WebhookService } from '@/modules/webhook/webhook.service';

type WebhookAckDto = { accepted: true };

export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  public getRoutes(): Hono {
    const app = new Hono();
    app.post('/post', (c) => this.receiveKeycloakEvent(c));
    return app;
  }

  private async receiveKeycloakEvent(c: Context): Promise<ControllerJson<WebhookAckDto, 200, readonly []>> {
    const payload: unknown = await c.req.json().catch(() => null);
    if (payload === null) {
      return c.json({ accepted: true }, 200);
    }

    const event = parseKeycloakWebhookEvent(payload);
    if (!event) {
      return c.json({ accepted: true }, 200);
    }

    const authDetails = event.authDetails as Record<string, unknown>;
    const details = (event as Record<string, unknown>).details as Record<string, unknown> | undefined;
    const username =
      (typeof authDetails.username === 'string' ? authDetails.username : undefined) ??
      (typeof details?.username === 'string' ? details.username : undefined);

    try {
      await this.webhookService.handleKeycloakEvent(event.type, event.authDetails.userId, username);
    } catch (err) {
      console.error('[webhook] Keycloak event processing failed:', err);
    }

    return c.json({ accepted: true }, 200);
  }
}
