import type { BaseUserRole } from '@/modules/users/user.types';

export type RequestUser = {
  id?: number;
  keycloakId: string;
  roles: string[];
  baseRole: BaseUserRole;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

declare module 'hono' {
  interface Variables {
    user?: RequestUser;
  }
}
