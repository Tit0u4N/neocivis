import { z } from 'zod';

export const KEYCLOAK_WEBHOOK_EVENT_TYPES = ['access.REGISTER', 'access.UPDATE', 'access.DELETE', 'access.UPDATE_PROFILE'] as const;

export type KeycloakWebhookEventType = (typeof KEYCLOAK_WEBHOOK_EVENT_TYPES)[number];

const keycloakWebhookEventSchema = z
  .object({
    type: z.enum(KEYCLOAK_WEBHOOK_EVENT_TYPES),
    authDetails: z
      .object({
        userId: z.string().min(1),
      })
      .passthrough(),
  })
  .passthrough();

export type KeycloakWebhookEvent = z.infer<typeof keycloakWebhookEventSchema>;

export function parseKeycloakWebhookEvent(payload: unknown): KeycloakWebhookEvent | null {
  const parsed = keycloakWebhookEventSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}
