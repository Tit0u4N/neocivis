import type { BaseErrorMessage } from './base.exception';

const INSUFFICIENT_ROLE_BASE = {
  code: 403,
  errorIdentifier: 'INSUFFICIENT_ROLE',
  message: 'Forbidden: Insufficient role',
} as const;

export type InsufficientRoleErrorMessage = BaseErrorMessage &
  typeof INSUFFICIENT_ROLE_BASE & {
    details: {
      requiredRoles: string[];
      userRoles: string[];
    };
  };

export const createInsufficientRoleError = (
  requiredRoles: string[],
  userRoles: string[],
): InsufficientRoleErrorMessage => ({
  ...INSUFFICIENT_ROLE_BASE,
  details: { requiredRoles, userRoles },
});
