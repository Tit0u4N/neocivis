import type { UserService } from '@/modules/users/service/user.service';
import type { KeycloakWebhookEventType } from './keycloak-webhook.schema';

export class WebhookService {
  constructor(private userService: UserService) {}

  async handleKeycloakEvent(type: KeycloakWebhookEventType, keycloakUserId: string, username?: string): Promise<void> {
    switch (type) {
      case 'access.REGISTER':
        await this.userService.handleKeycloakRegister(keycloakUserId);
        return;
      case 'access.UPDATE':
      case 'access.UPDATE_PROFILE':
      await this.userService.handleKeycloakUpdate(keycloakUserId);
        return;
      case 'access.DELETE':
        await this.userService.handleKeycloakDelete(keycloakUserId, username);
        return;
      default: {
        const Exhaustive: never = type;
        return Exhaustive;
      }
    }
  }
}
