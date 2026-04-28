import type { BaseUserRole } from '../user.types';

type RealmConfigUser = {
  username: string;
  enabled: boolean;
  emailVerified: boolean;
  email: string;
  lastName: string;
  firstName: string;
  realmRoles: string[];
};

export type SeededUser = Readonly<{
  seedId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: BaseUserRole;
  realmRoles: string[];
}>;

function pickBaseRole(realmRoles: string[]): BaseUserRole {
  if (realmRoles.includes('ADMIN')) {
    return 'ADMIN';
  }
  if (realmRoles.includes('EMPLOYEE')) {
    return 'EMPLOYEE';
  }
  return 'CITIZEN';
}

/**
 * Source de vérité pour le seed DB des users en dev.
 * Copié depuis `src/config/realm-config-dev.json` (section "users"),
 * pour éviter de dépendre d'un import/FS read du JSON au runtime.
 */
const realmConfigDevUsers: RealmConfigUser[] = [
  {
    username: 'citizen1',
    enabled: true,
    emailVerified: true,
    email: 'cit1@example.com',
    lastName: 'One',
    firstName: 'Citizen',
    realmRoles: ['CITIZEN'],
  },
  {
    username: 'municipal-employee1',
    enabled: true,
    emailVerified: true,
    email: 'emp1@neocivis.cloud',
    lastName: 'Employee1',
    firstName: 'Municipal',
    realmRoles: ['EMPLOYEE', 'SIGNAL_VIEW_PERMISSION', 'SIGNAL_CREATE_PERMISSION', 'SIGNAL_MODIFY_PERMISSION'],
  },
  {
    username: 'admin1',
    enabled: true,
    emailVerified: true,
    email: 'admin@example.com',
    lastName: 'Min',
    firstName: 'Ad',
    realmRoles: ['ADMIN', 'EMPLOYEE'],
  },
];

export function loadSeededUsersFromRealmConfigDev(): SeededUser[] {
  const seeded: SeededUser[] = [];
  for (const u of realmConfigDevUsers) {
    if (!u?.enabled) {
      continue;
    }
    const username = typeof u.username === 'string' ? u.username.trim() : '';
    if (!username) {
      continue;
    }
    const realmRoles = Array.isArray(u.realmRoles) ? u.realmRoles.filter((r) => typeof r === 'string') : [];
    seeded.push({
      seedId: seeded.length + 1,
      username,
      email: typeof u.email === 'string' ? u.email : '',
      firstName: typeof u.firstName === 'string' ? u.firstName : '',
      lastName: typeof u.lastName === 'string' ? u.lastName : '',
      role: pickBaseRole(realmRoles),
      realmRoles,
    });
  }

  return seeded;
}
