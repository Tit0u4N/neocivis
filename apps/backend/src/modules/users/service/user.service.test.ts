import { describe, expect, it, vi } from 'vitest';
import type { IAMService } from '@/modules/iam/iam.service';
import type { IMediaBlobService } from '@/modules/media/media-blob.service';
import type { IUserRepository } from '../repository/user.repository.interface';
import type { User } from '../user.types';
import { UserService } from './user.service';

function makeUser(overrides: Partial<User> & Pick<User, 'id' | 'keycloakId'>): User {
  const now = new Date();
  return {
    username: 'user',
    email: 'user@example.com',
    firstName: 'First',
    lastName: 'Last',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    role: 'CITIZEN' as const,
    profilePictureUrl: null,
    ...overrides,
  };
}

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
    updateUserProfile: vi.fn(async () => {}),
    sendPasswordResetEmail: vi.fn(async () => {}),
    ...overrides,
  };
}

function makeMediaBlob(overrides: Partial<IMediaBlobService> = {}): IMediaBlobService {
  return {
    uploadImage: vi.fn(),
    uploadImageFromScope: vi.fn(),
    uploadToStoragePath: vi.fn(async () => ({
      url: 'https://blob.test/profile-pictures/kc-1/uuid.jpg',
      storagePath: 'profile-pictures/kc-1/uuid.jpg',
    })),
    deleteByStoragePath: vi.fn(async () => {}),
    getProfilePicturePlaceholderUrl: vi.fn(() => 'https://blob.test/placeholder.jpg'),
    ...overrides,
  };
}

describe('UserService', () => {
  describe('getAll', () => {
    it('returns all users from the repository', async () => {
      const u1 = makeUser({ id: 1, keycloakId: 'kc-1' });
      const repo = makeRepository({ getAll: vi.fn(async () => [u1]) });
      const users = await new UserService(repo, makeIam()).getAll();
      expect(users).toEqual([u1]);
    });
  });

  describe('getById', () => {
    it('returns the user when found', async () => {
      const user = makeUser({ id: 1, keycloakId: 'kc-1' });
      const repo = makeRepository({ getById: vi.fn(async (id: number) => (id === 1 ? user : undefined)) });
      await expect(new UserService(repo, makeIam()).getById(1)).resolves.toEqual(user);
    });

    it('returns undefined when not found', async () => {
      await expect(new UserService(makeRepository(), makeIam()).getById(999)).resolves.toBeUndefined();
    });
  });

  describe('getByIds', () => {
    it('returns the matching users', async () => {
      const u1 = makeUser({ id: 1, keycloakId: 'kc-1' });
      const u2 = makeUser({ id: 2, keycloakId: 'kc-2' });
      const repo = makeRepository({ getByIds: vi.fn(async () => [u1, u2]) });
      await expect(new UserService(repo, makeIam()).getByIds([1, 2])).resolves.toHaveLength(2);
    });
  });

  describe('getByKeycloakId', () => {
    it('returns the user when found by Keycloak id', async () => {
      const user = makeUser({ id: 1, keycloakId: 'kc-abc' });
      const repo = makeRepository({
        getByKeycloakId: vi.fn(async (id: string) => (id === 'kc-abc' ? user : undefined)),
      });
      await expect(new UserService(repo, makeIam()).getByKeycloakId('kc-abc')).resolves.toEqual(user);
    });
  });

  describe('syncFromHeaders', () => {
    it('inserts a new user when none exists', async () => {
      const repo = makeRepository();
      await new UserService(repo, makeIam()).syncFromHeaders({
        keycloakId: 'kc-1',
        role: 'CITIZEN',
        username: 'john',
        email: 'j@x.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(repo.insertFromHeaders).toHaveBeenCalledOnce();
      expect(repo.updateFromHeaders).not.toHaveBeenCalled();
    });

    it('updates an existing user', async () => {
      const existing = makeUser({ id: 1, keycloakId: 'kc-1' });
      const repo = makeRepository({ getByKeycloakId: vi.fn(async () => existing) });
      await new UserService(repo, makeIam()).syncFromHeaders({ keycloakId: 'kc-1', role: 'CITIZEN', username: 'john' });
      expect(repo.updateFromHeaders).toHaveBeenCalledOnce();
      expect(repo.insertFromHeaders).not.toHaveBeenCalled();
    });

    it('enriches missing profile fields from Keycloak IAM', async () => {
      const repo = makeRepository();
      const iam = makeIam({
        getUserProfileById: vi.fn(async () => ({
          username: 'john',
          email: 'john@x.com',
          firstName: 'John',
          lastName: 'Doe',
        })),
      });
      await new UserService(repo, iam).syncFromHeaders({ keycloakId: 'kc-1', role: 'CITIZEN' });
      expect(iam.getUserProfileById).toHaveBeenCalledWith('kc-1');
      expect(repo.insertFromHeaders).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'john', email: 'john@x.com' }),
      );
    });

    it('skips IAM call when all profile fields are already present', async () => {
      const repo = makeRepository();
      const iam = makeIam();
      await new UserService(repo, iam).syncFromHeaders({
        keycloakId: 'kc-1',
        role: 'CITIZEN',
        username: 'john',
        email: 'john@x.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(iam.getUserProfileById).not.toHaveBeenCalled();
    });
  });

  describe('updateMyProfile', () => {
    it('calls IAM updateUserProfile then updates the DB record', async () => {
      const existing = makeUser({ id: 1, keycloakId: 'kc-1', username: 'old', email: 'old@x.com' });
      const repo = makeRepository({ getByKeycloakId: vi.fn(async () => existing) });
      const iam = makeIam();
      await new UserService(repo, iam).updateMyProfile('kc-1', { username: 'new', firstName: 'New' });
      expect(iam.updateUserProfile).toHaveBeenCalledWith('kc-1', expect.objectContaining({ username: 'new' }));
      expect(repo.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ username: 'new', firstName: 'New' }));
    });

    it('merges undefined input fields with existing DB values', async () => {
      const existing = makeUser({
        id: 1,
        keycloakId: 'kc-1',
        username: 'old',
        firstName: 'Keep',
        lastName: 'This',
        email: 'keep@x.com',
      });
      const repo = makeRepository({ getByKeycloakId: vi.fn(async () => existing) });
      await new UserService(repo, makeIam()).updateMyProfile('kc-1', { username: 'new' });
      expect(repo.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'new', firstName: 'Keep', lastName: 'This' }),
      );
    });

    it('skips the DB update when the user is not found in the repository', async () => {
      const repo = makeRepository();
      await new UserService(repo, makeIam()).updateMyProfile('kc-ghost', { username: 'new' });
      expect(repo.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateProfilePicture', () => {
    it('throws when the blob service is not configured', async () => {
      const service = new UserService(makeRepository(), makeIam());
      await expect(
        service.updateProfilePicture('kc-1', new ArrayBuffer(8), 'photo.jpg', 'image/jpeg'),
      ).rejects.toThrow('Blob service not configured');
    });

    it('throws for unsupported mime types', async () => {
      const service = new UserService(makeRepository(), makeIam(), makeMediaBlob());
      await expect(
        service.updateProfilePicture('kc-1', new ArrayBuffer(8), 'file.pdf', 'application/pdf'),
      ).rejects.toThrow('Unsupported image type');
    });

    it('throws when the buffer exceeds the 5 MB limit', async () => {
      const service = new UserService(makeRepository(), makeIam(), makeMediaBlob());
      await expect(
        service.updateProfilePicture('kc-1', new ArrayBuffer(6 * 1024 * 1024), 'photo.jpg', 'image/jpeg'),
      ).rejects.toThrow('exceeds maximum size');
    });

    it('uploads the image and stores the new URL', async () => {
      const repo = makeRepository();
      const blob = makeMediaBlob({
        uploadToStoragePath: vi.fn(async () => ({
          url: 'https://blob.test/new.jpg',
          storagePath: 'profile-pictures/kc-1/uuid.jpg',
        })),
      });
      await new UserService(repo, makeIam(), blob).updateProfilePicture(
        'kc-1',
        new ArrayBuffer(8),
        'photo.jpg',
        'image/jpeg',
      );
      expect(repo.updateProfilePictureUrl).toHaveBeenCalledWith('kc-1', 'https://blob.test/new.jpg');
    });

    it('deletes the old blob before uploading a new one', async () => {
      const existing = makeUser({
        id: 1,
        keycloakId: 'kc-1',
        profilePictureUrl: 'https://blob.test/pp/kc-1/old.jpg',
      });
      const repo = makeRepository({ getByKeycloakId: vi.fn(async () => existing) });
      const blob = makeMediaBlob();
      await new UserService(repo, makeIam(), blob).updateProfilePicture(
        'kc-1',
        new ArrayBuffer(8),
        'photo.jpg',
        'image/jpeg',
      );
      expect(blob.deleteByStoragePath).toHaveBeenCalledOnce();
    });
  });

  describe('removeProfilePicture', () => {
    it('throws when the blob service is not configured', async () => {
      const service = new UserService(makeRepository(), makeIam());
      await expect(service.removeProfilePicture('kc-1')).rejects.toThrow('Blob service not configured');
    });

    it('does nothing when the user is not found in the repository', async () => {
      const repo = makeRepository();
      const blob = makeMediaBlob();
      await new UserService(repo, makeIam(), blob).removeProfilePicture('kc-ghost');
      expect(blob.deleteByStoragePath).not.toHaveBeenCalled();
      expect(repo.updateProfilePictureUrl).not.toHaveBeenCalled();
    });

    it('clears the URL without deleting when the user has no picture', async () => {
      const existing = makeUser({ id: 1, keycloakId: 'kc-1', profilePictureUrl: null });
      const repo = makeRepository({ getByKeycloakId: vi.fn(async () => existing) });
      const blob = makeMediaBlob();
      await new UserService(repo, makeIam(), blob).removeProfilePicture('kc-1');
      expect(blob.deleteByStoragePath).not.toHaveBeenCalled();
      expect(repo.updateProfilePictureUrl).toHaveBeenCalledWith('kc-1', null);
    });

    it('deletes the old blob and clears the URL', async () => {
      const existing = makeUser({
        id: 1,
        keycloakId: 'kc-1',
        profilePictureUrl: 'https://blob.test/pp/kc-1/pic.jpg',
      });
      const repo = makeRepository({ getByKeycloakId: vi.fn(async () => existing) });
      const blob = makeMediaBlob();
      await new UserService(repo, makeIam(), blob).removeProfilePicture('kc-1');
      expect(blob.deleteByStoragePath).toHaveBeenCalledOnce();
      expect(repo.updateProfilePictureUrl).toHaveBeenCalledWith('kc-1', null);
    });
  });

  describe('toPublicDto', () => {
    it('uses the placeholder URL when the user has no picture', () => {
      const user = makeUser({ id: 1, keycloakId: 'kc-1', profilePictureUrl: null });
      const dto = new UserService(makeRepository(), makeIam(), makeMediaBlob()).toPublicDto(user);
      expect(dto.profilePictureUrl).toBe('https://blob.test/placeholder.jpg');
    });

    it('uses the actual picture URL when set', () => {
      const user = makeUser({ id: 1, keycloakId: 'kc-1', profilePictureUrl: 'https://blob.test/actual.jpg' });
      const dto = new UserService(makeRepository(), makeIam(), makeMediaBlob()).toPublicDto(user);
      expect(dto.profilePictureUrl).toBe('https://blob.test/actual.jpg');
    });
  });

  describe('toMeDto', () => {
    it('includes role and email fields not present in the public DTO', () => {
      const user = makeUser({ id: 5, keycloakId: 'kc-5', email: 'me@x.com', role: 'ADMIN' as const });
      const dto = new UserService(makeRepository(), makeIam()).toMeDto(user);
      expect(dto.email).toBe('me@x.com');
      expect(dto.role).toBe('ADMIN');
      expect(dto.id).toBe(5);
    });
  });
});
