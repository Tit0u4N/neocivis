// Add Vitest unit tests for UserService
import { describe, expect, it, vi } from 'vitest';
import { UserService } from './user.service';

describe('UserService', () => {
  const seededUsers = [
    {
      id: 1,
      keycloakId: 'kc_1',
      username: 'user1',
      email: 'user1@example.com',
      firstName: 'User',
      lastName: 'One',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      role: 'CITIZEN' as const,
    },
    {
      id: 2,
      keycloakId: 'kc_2',
      username: 'user2',
      email: 'user2@example.com',
      firstName: 'User',
      lastName: 'Two',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      role: 'EMPLOYEE' as const,
    },
  ];

  const repository = {
    getAll: vi.fn(async () => seededUsers),
    getById: vi.fn(async (id: number) => seededUsers.find((u) => u.id === id)),
    getByKeycloakId: vi.fn(async (keycloakId: string) => seededUsers.find((u) => u.keycloakId === keycloakId)),
  };

  // `UserService` depends on the repository contract, not its concrete implementation.
  const service = new UserService(repository as any);

  it('should return all users', async () => {
    const users = await service.getAll();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users).toEqual(seededUsers);
  });

  it('should return a user by id when found', async () => {
    const user = await service.getById(1);
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.keycloakId).toBe('kc_1');
    expect(user?.role).toBe('CITIZEN');
  });

  it('should return undefined when user not found', async () => {
    const user = await service.getById(999);
    expect(user).toBeUndefined();
  });
});
