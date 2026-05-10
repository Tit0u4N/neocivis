export type { BaseUserRole } from '@repo/contracts';

import type { BaseUserRole, UserMeDto, UserPublicDto } from '@repo/contracts';

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
};

export function toUserPublicDto(user: User): UserPublicDto {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export function toUserMeDto(user: User): UserMeDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    // it will be set by the city service if needed
    city: undefined,
    memberships: [],
  };
}
