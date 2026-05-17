import { describe, expect, it, vi } from 'vitest';
import type { UserService } from '@/modules/users/service/user.service';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  it('routes access.REGISTER to user service', async () => {
    const userService = {
      handleKeycloakRegister: vi.fn(async () => {}),
      handleKeycloakUpdate: vi.fn(async () => {}),
      handleKeycloakDelete: vi.fn(async () => {}),
    } as unknown as UserService;

    const service = new WebhookService(userService);
    await service.handleKeycloakEvent('access.REGISTER', 'kc-1');

    expect(userService.handleKeycloakRegister).toHaveBeenCalledWith('kc-1');
  });

  it('routes access.UPDATE to user service', async () => {
    const userService = {
      handleKeycloakRegister: vi.fn(async () => {}),
      handleKeycloakUpdate: vi.fn(async () => {}),
      handleKeycloakDelete: vi.fn(async () => {}),
    } as unknown as UserService;

    const service = new WebhookService(userService);
    await service.handleKeycloakEvent('access.UPDATE', 'kc-2');

    expect(userService.handleKeycloakUpdate).toHaveBeenCalledWith('kc-2');
  });

  it('routes access.DELETE to user service', async () => {
    const userService = {
      handleKeycloakRegister: vi.fn(async () => {}),
      handleKeycloakUpdate: vi.fn(async () => {}),
      handleKeycloakDelete: vi.fn(async () => {}),
    } as unknown as UserService;

    const service = new WebhookService(userService);
    await service.handleKeycloakEvent('access.DELETE', 'kc-3', 'e2e-user');

    expect(userService.handleKeycloakDelete).toHaveBeenCalledWith('kc-3', 'e2e-user');
  });
});
