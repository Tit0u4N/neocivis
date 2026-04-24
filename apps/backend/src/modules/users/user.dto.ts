import type { User } from './user.types';

export type UserPublicDto = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

export function toUserPublicDto(user: User): UserPublicDto {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

