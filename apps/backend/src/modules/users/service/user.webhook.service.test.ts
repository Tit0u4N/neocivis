import { describe, expect, it, vi } from 'vitest';
import type { IAMService } from '@/modules/iam/iam.service';
import type { IUserRepository } from '../repository/user.repository.interface';
import { toUserPublicDtoForCitizen, USER_DELETED_PLACEHOLDER } from '../user.types';
import { UserService } from './user.service';

describe('UserService Keycloak webhooks', () => {
  const keycloakId = 'kc-webhook-1';

  function makeRepository(overrides: Partial<IUserRepository> = {}): IUserRepository {
    return {
      getAll: vi.fn(async () => []),
      getById: vi.fn(async () => undefined),
      getByIds: vi.fn(async () => []),
      getByKeycloakId: vi.fn(async () => undefined),
      insertFromHeaders: vi.fn(async () => {}),
      updateFromHeaders: vi.fn(async () => {}),
      insertCitizenFromKeycloak: vi.fn(async () => {}),
      updateProfile: vi.fn(async () => {}),
      updateProfilePictureUrl: vi.fn(async () => {}),
      markDeletedByKeycloakId: vi.fn(async () => {}),
      insertSeeded: vi.fn(async () => {}),
      deleteAll: vi.fn(async () => {}),
      setNextId: vi.fn(async () => {}),
      ...overrides,
    };
  }

  function makeIam(overrides: Partial<IAMService> = {}): IAMService {
    return {
      getUserProfileById: vi.fn(async () => null),
      getUserByUsername: vi.fn(async () => null),
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      assignRealmRoles: vi.fn(async () => {}),
      isUserAbsentFromKeycloak: vi.fn(async () => true),
      ...overrides,
    };
  }

  it('handleKeycloakRegister skips when user missing in Keycloak', async () => {
    const repository = makeRepository();
    const iam = makeIam();
    const service = new UserService(repository, iam);

    await service.handleKeycloakRegister(keycloakId);

    expect(iam.assignRealmRoles).not.toHaveBeenCalled();
    expect(repository.insertCitizenFromKeycloak).not.toHaveBeenCalled();
  });

  it('handleKeycloakRegister creates citizen from Keycloak profile', async () => {
    const repository = makeRepository();
    const iam = makeIam({
      getUserProfileById: vi.fn(async () => ({
        username: 'citizen',
        email: 'c@example.com',
        firstName: 'Cit',
        lastName: 'Zen',
      })),
    });
    const service = new UserService(repository, iam);

    await service.handleKeycloakRegister(keycloakId);

    expect(iam.assignRealmRoles).toHaveBeenCalledWith(keycloakId, ['CITIZEN']);
    expect(repository.insertCitizenFromKeycloak).toHaveBeenCalledWith({
      keycloakId,
      username: 'citizen',
      email: 'c@example.com',
      firstName: 'Cit',
      lastName: 'Zen',
    });
  });

  it('handleKeycloakDelete skips when user still exists in Keycloak', async () => {
    vi.useFakeTimers();
    const repository = makeRepository({
      getByKeycloakId: vi.fn(async () => ({
        id: 1,
        keycloakId,
        username: 'u',
        email: 'u@x.com',
        firstName: 'U',
        lastName: 'Ser',
        role: 'CITIZEN',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
    });
    const iam = makeIam({
      isUserAbsentFromKeycloak: vi.fn(async () => false),
    });
    const service = new UserService(repository, iam);

    const promise = service.handleKeycloakDelete(keycloakId, 'e2e-user');
    await vi.advanceTimersByTimeAsync(12_000);
    await promise;

    expect(repository.markDeletedByKeycloakId).not.toHaveBeenCalled();
    expect(iam.isUserAbsentFromKeycloak).toHaveBeenCalledWith(keycloakId, 'e2e-user');
    vi.useRealTimers();
  });

  it('handleKeycloakDelete marks user as deleted when absent from Keycloak', async () => {
    const repository = makeRepository({
      getByKeycloakId: vi.fn(async () => ({
        id: 1,
        keycloakId,
        username: 'u',
        email: 'u@x.com',
        firstName: 'U',
        lastName: 'Ser',
        role: 'CITIZEN',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
    });
    const iam = makeIam({
      isUserAbsentFromKeycloak: vi.fn(async () => true),
    });
    const service = new UserService(repository, iam);

    await service.handleKeycloakDelete(keycloakId, 'e2e-user');

    expect(iam.isUserAbsentFromKeycloak).toHaveBeenCalledWith(keycloakId, 'e2e-user');
    expect(repository.markDeletedByKeycloakId).toHaveBeenCalledWith(keycloakId);
  });

  it('handleKeycloakDelete polls Keycloak until user is gone', async () => {
    vi.useFakeTimers();
    const repository = makeRepository({
      getByKeycloakId: vi.fn(async () => ({
        id: 1,
        keycloakId,
        username: 'u',
        email: 'u@x.com',
        firstName: 'U',
        lastName: 'Ser',
        role: 'CITIZEN',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
    });
    const iam = makeIam({
      isUserAbsentFromKeycloak: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValue(true),
    });
    const service = new UserService(repository, iam);

    const promise = service.handleKeycloakDelete(keycloakId, 'e2e-user');
    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(iam.isUserAbsentFromKeycloak).toHaveBeenCalledTimes(3);
    expect(repository.markDeletedByKeycloakId).toHaveBeenCalledWith(keycloakId);
    vi.useRealTimers();
  });

  it('toUserPublicDtoForCitizen masks deleted users', () => {
    const placeholder = 'https://example.com/placeholder.jpg';
    const dto = toUserPublicDtoForCitizen(
      {
        id: 42,
        keycloakId: 'kc',
        username: 'real',
        email: 'r@x.com',
        firstName: 'Real',
        lastName: 'User',
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        profilePictureUrl: null,
      },
      placeholder,
    );

    expect(dto).toEqual({
      id: 42,
      username: USER_DELETED_PLACEHOLDER,
      firstName: USER_DELETED_PLACEHOLDER,
      lastName: USER_DELETED_PLACEHOLDER,
      profilePictureUrl: placeholder,
    });
  });
});
