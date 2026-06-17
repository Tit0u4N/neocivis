import { randomUUID } from 'node:crypto';
import type { UpdateAccountInput, UserMeDto, UserPublicDto } from '@repo/contracts';
import type { IAMService, IamUser, IamUserProfile } from '@/modules/iam/iam.service';
import type { IMediaBlobService } from '@/modules/media/media-blob.service';
import type {
  InsertSeededUserInput,
  IUserRepository,
  UpsertUserFromHeadersInput,
} from '../repository/user.repository.interface';
import { toUserMeDto, toUserPublicDto, toUserPublicDtoForCitizen, type User } from '../user.types';

const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export class UserService {
  constructor(
    private repository: IUserRepository,
    private iamService: IAMService,
    private mediaBlobService?: IMediaBlobService,
  ) {}

  async getIamUserByUsername(username: string): Promise<IamUser | null> {
    return await this.iamService.getUserByUsername(username);
  }

  async getIamProfileByKeycloakId(keycloakId: string): Promise<IamUserProfile | null> {
    return await this.iamService.getUserProfileById(keycloakId);
  }

  async getAll(): Promise<User[]> {
    return await this.repository.getAll();
  }

  async getById(id: number): Promise<User | undefined> {
    return await this.repository.getById(id);
  }

  async getByIds(ids: number[]): Promise<User[]> {
    return await this.repository.getByIds(ids);
  }

  async getByKeycloakId(keycloakId: string): Promise<User | undefined> {
    return await this.repository.getByKeycloakId(keycloakId);
  }

  /**
   * Synchronise l'utilisateur (Keycloak -> DB) à chaque requête authentifiée.
   * - si l'utilisateur n'existe pas: insert
   * - sinon: update (role + infos)
   */
  async syncFromHeaders(input: UpsertUserFromHeadersInput): Promise<void> {
    const needsProfile =
      input.username === undefined ||
      input.email === undefined ||
      input.firstName === undefined ||
      input.lastName === undefined;

    let resolved = input;
    if (needsProfile) {
      const profile = await this.iamService.getUserProfileById(input.keycloakId);
      if (profile) {
        resolved = {
          ...input,
          username: input.username ?? profile.username,
          email: input.email ?? profile.email,
          firstName: input.firstName ?? profile.firstName,
          lastName: input.lastName ?? profile.lastName,
        };
      }
    }

    const existing = await this.repository.getByKeycloakId(input.keycloakId);
    if (!existing) {
      await this.repository.insertFromHeaders(resolved);
      return;
    }
    await this.repository.updateFromHeaders(resolved);
  }

  async seedFromKeycloak(input: InsertSeededUserInput): Promise<void> {
    const existing = await this.repository.getByKeycloakId(input.keycloakId);
    if (!existing) {
      await this.repository.insertSeeded(input);
      return;
    }
    await this.repository.updateFromHeaders(input);
    if (input.profilePictureUrl) {
      await this.repository.updateProfilePictureUrl(input.keycloakId, input.profilePictureUrl);
    }
  }

  /**
   * Met à jour le profil de l'utilisateur courant dans Keycloak, puis en DB.
   * La DB est mise à jour directement sans attendre le webhook access.UPDATE.
   */
  async updateMyProfile(keycloakId: string, input: UpdateAccountInput): Promise<void> {
    await this.iamService.updateUserProfile(keycloakId, {
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (existing) {
      await this.repository.updateProfile({
        keycloakId,
        username: input.username ?? existing.username,
        email: input.email ?? existing.email,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
      });
    }
  }

  /**
   * Déclenche l'envoi d'un e-mail UPDATE_PASSWORD via Keycloak.
   * `clientId` est passé à Keycloak pour que le template FTL puisse brancher sur le bon style.
   */
  async sendPasswordResetEmail(keycloakId: string, clientId: string): Promise<void> {
    await this.iamService.sendPasswordResetEmail(keycloakId, clientId);
  }

  toPublicDto(user: User): UserPublicDto {
    return toUserPublicDto(user, this.placeholderUrl());
  }

  toPublicDtoForCitizen(user: User): UserPublicDto {
    return toUserPublicDtoForCitizen(user, this.placeholderUrl());
  }

  toMeDto(user: User): UserMeDto {
    return toUserMeDto(user, this.placeholderUrl());
  }

  private placeholderUrl(): string {
    return this.mediaBlobService?.getProfilePicturePlaceholderUrl() ?? '';
  }

  async updateProfilePicture(
    keycloakId: string,
    buffer: ArrayBuffer | Buffer,
    filename: string,
    mimeType: string,
  ): Promise<void> {
    if (!this.mediaBlobService) {
      throw new Error('Blob service not configured');
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}`);
    }
    if (buffer.byteLength > MAX_PROFILE_PICTURE_BYTES) {
      throw new Error('Image exceeds maximum size of 5 MB');
    }

    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const storagePath = `profile-pictures/${keycloakId}/${randomUUID()}${ext}`;

    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (existing?.profilePictureUrl) {
      const oldStoragePath = existing.profilePictureUrl.split('/').slice(-3).join('/');
      await this.mediaBlobService.deleteByStoragePath(oldStoragePath).catch(() => {});
    }

    const uploaded = await this.mediaBlobService.uploadToStoragePath(buffer, mimeType, storagePath);
    await this.repository.updateProfilePictureUrl(keycloakId, uploaded.url);
  }

  async removeProfilePicture(keycloakId: string): Promise<void> {
    if (!this.mediaBlobService) {
      throw new Error('Blob service not configured');
    }
    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (!existing) {
      return;
    }
    if (existing.profilePictureUrl) {
      const oldStoragePath = existing.profilePictureUrl.split('/').slice(-3).join('/');
      await this.mediaBlobService.deleteByStoragePath(oldStoragePath).catch(() => {});
    }
    await this.repository.updateProfilePictureUrl(keycloakId, null);
  }

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }

  async setNextId(nextId: number): Promise<void> {
    await this.repository.setNextId(nextId);
  }

  /**
   * access.REGISTER : vérifie Keycloak, assigne le rôle realm CITIZEN, crée l'utilisateur en base.
   * Ne fait rien si l'utilisateur n'existe pas dans Keycloak.
   */
  async handleKeycloakRegister(keycloakId: string): Promise<void> {
    const profile = await this.iamService.getUserProfileById(keycloakId);
    if (!profile) {
      return;
    }

    await this.iamService.assignRealmRoles(keycloakId, ['CITIZEN']);

    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (existing) {
      if (existing.deletedAt !== null) {
        return;
      }
      await this.repository.updateProfile({
        keycloakId,
        username: profile.username ?? '',
        email: profile.email ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
      });
      return;
    }

    await this.repository.insertCitizenFromKeycloak({
      keycloakId,
      username: profile.username ?? '',
      email: profile.email ?? '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
    });
  }

  /**
   * access.UPDATE : met à jour nom / email depuis Keycloak (pas le rôle).
   */
  async handleKeycloakUpdate(keycloakId: string): Promise<void> {
    const profile = await this.iamService.getUserProfileById(keycloakId);
    if (!profile) {
      return;
    }

    const existing = await this.repository.getByKeycloakId(keycloakId);
    if (!existing || existing.deletedAt !== null) {
      return;
    }

    await this.repository.updateProfile({
      keycloakId,
      username: profile.username ?? existing.username,
      email: profile.email ?? existing.email,
      firstName: profile.firstName ?? existing.firstName,
      lastName: profile.lastName ?? existing.lastName,
    });
  }

  /**
   * access.DELETE : marque l'utilisateur supprimé (soft delete) seulement si Keycloak
   * confirme que l'utilisateur n'existe plus (le webhook seul n'est pas une source de vérité).
   * Keycloak peut mettre quelques secondes à propager la suppression → poll court.
   */
  async handleKeycloakDelete(keycloakId: string, username?: string): Promise<void> {
    const maxAttempts = 20;
    const delayMs = 500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const absent = await this.iamService.isUserAbsentFromKeycloak(keycloakId, username);
      if (absent) {
        const existing = await this.repository.getByKeycloakId(keycloakId);
        if (!existing) {
          return;
        }
        await this.repository.markDeletedByKeycloakId(keycloakId);
        return;
      }
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}
