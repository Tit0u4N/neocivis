import type { ISeeder } from '@/core/seeder.interface';
import { getCachedImageBuffer } from '@/infrastructure/media/image-seed-cache';
import type { IMediaBlobService } from '@/modules/media/media-blob.service';
import { PROFILE_PICTURE_PLACEHOLDER_PATH } from '@/modules/media/media-blob.service';
import type { UserService } from '../service/user.service';
import avatarUrl from './avatar.jpg';
import { loadSeededUsersFromRealmConfigDev } from './user.seed';

export class UserSeeder implements ISeeder {
  constructor(
    private userService: UserService,
    private mediaBlobService?: IMediaBlobService,
  ) {}

  async deleteAll(): Promise<void> {
    await this.userService.deleteAll();
    await this.userService.setNextId(1);
  }

  async seed(): Promise<void> {
    if (this.mediaBlobService) {
      await this.seedProfilePicturePlaceholder();
    }

    const seededUsers = loadSeededUsersFromRealmConfigDev();
    for (const seeded of seededUsers) {
      const kcUser = await this.userService.getIamUserByUsername(seeded.username);
      if (!kcUser) {
        throw new Error(
          `Keycloak user not found or IAM not configured for username="${seeded.username}". Seeding requires Keycloak.`,
        );
      }
      const keycloakId = kcUser.id;

      await this.userService.seedFromKeycloak({
        id: seeded.seedId,
        keycloakId,
        role: seeded.role,
        username: kcUser.username ?? seeded.username,
        email: kcUser.email ?? seeded.email,
        firstName: kcUser.firstName ?? seeded.firstName,
        lastName: kcUser.lastName ?? seeded.lastName,
      });

      if (this.mediaBlobService) {
        const buffer = await getCachedImageBuffer(seeded.profilePictureUrl, `avatar-${seeded.username}`).catch(
          (err: unknown) => {
            // biome-ignore lint/suspicious/noConsole: seed diagnostics
            console.warn(`[seed] Failed to download avatar for ${seeded.username}:`, err);
            return null;
          },
        );
        if (buffer) {
          await this.userService.updateProfilePicture(keycloakId, buffer, 'avatar.jpg', 'image/jpeg');
        }
      }
    }
    const nextId = Math.max(...seededUsers.map((u) => u.seedId)) + 1;
    await this.userService.setNextId(nextId);
  }

  private async seedProfilePicturePlaceholder(): Promise<void> {
    if (!this.mediaBlobService) {
      return;
    }
    const buffer = Buffer.from(avatarUrl, 'base64');
    await this.mediaBlobService.uploadToStoragePath(buffer, 'image/jpeg', PROFILE_PICTURE_PLACEHOLDER_PATH);
  }
}
