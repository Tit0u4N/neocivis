// Add Vitest unit tests for UserService
import { describe, expect, it } from 'vitest';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  const repository = new UserRepository();
  const service = new UserService(repository);

  it('should return all users', () => {
    const users = service.getAll();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    // ensure it matches the repository initial state
    expect(users).toEqual(repository.getAll());
  });

  it('should return a user by id when found', () => {
    const user = service.getById('1');
    expect(user).toBeDefined();
    expect(user?.id).toBe('1');
    expect(user?.name).toBe('John Doe');
  });

  it('should return undefined when user not found', () => {
    const user = service.getById('non-existing-id');
    expect(user).toBeUndefined();
  });
});
