export type { BaseUserRole } from '@repo/contracts';

import type { BaseUserRole, UserMeDto, UserPublicDto } from '@repo/contracts';

export const USER_DELETED_PLACEHOLDER = 'USER_DELETED';

export type User = {
  id: number;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  role: BaseUserRole;
  deletedAt: Date | null;
  profilePictureUrl: string | null;
};

export function toUserPublicDto(user: User, placeholderUrl: string): UserPublicDto {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePictureUrl: user.profilePictureUrl ?? placeholderUrl,
  };
}

/** Masque les utilisateurs supprimés pour les vues citoyen (ex. `/user/by-ids`). */
export function toUserPublicDtoForCitizen(user: User, placeholderUrl: string): UserPublicDto {
  if (user.deletedAt !== null) {
    return {
      id: user.id,
      username: USER_DELETED_PLACEHOLDER,
      firstName: USER_DELETED_PLACEHOLDER,
      lastName: USER_DELETED_PLACEHOLDER,
      profilePictureUrl: placeholderUrl,
    };
  }
  return toUserPublicDto(user, placeholderUrl);
}

export function toUserMeDto(user: User, placeholderUrl: string): UserMeDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profilePictureUrl: user.profilePictureUrl ?? placeholderUrl,
    // city / memberships / permissions / roles are filled by the controller
    // depending on the user role and the access/city services.
    city: undefined,
    memberships: [],
    permissions: [],
    roles: [],
  };
}
