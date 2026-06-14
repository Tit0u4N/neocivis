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
  profilePictureUrl: string;
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
    username: 'citizen2',
    enabled: true,
    emailVerified: true,
    email: 'cit2@example.com',
    lastName: 'Two',
    firstName: 'Citizen',
    realmRoles: ['CITIZEN'],
  },
  {
    username: 'citizen3',
    enabled: true,
    emailVerified: true,
    email: 'cit3@example.com',
    lastName: 'Three',
    firstName: 'Citizen',
    realmRoles: ['CITIZEN'],
  },
  {
    username: 'admin-nice',
    enabled: true,
    emailVerified: true,
    email: 'admin.nice@neocivis.cloud',
    lastName: 'Nice',
    firstName: 'Admin',
    realmRoles: ['ADMIN'],
  },
  {
    username: 'admin-biot',
    enabled: true,
    emailVerified: true,
    email: 'admin.biot@neocivis.cloud',
    lastName: 'Biot',
    firstName: 'Admin',
    realmRoles: ['ADMIN'],
  },
  {
    username: 'admin-marseille',
    enabled: true,
    emailVerified: true,
    email: 'admin.marseille@neocivis.cloud',
    lastName: 'Marseille',
    firstName: 'Admin',
    realmRoles: ['ADMIN'],
  },
  {
    username: 'employee-nice1',
    enabled: true,
    emailVerified: true,
    email: 'employee.nice1@neocivis.cloud',
    lastName: 'Nice1',
    firstName: 'Employee',
    realmRoles: ['EMPLOYEE'],
  },
  {
    username: 'employee-biot1',
    enabled: true,
    emailVerified: true,
    email: 'employee.biot1@neocivis.cloud',
    lastName: 'Biot1',
    firstName: 'Employee',
    realmRoles: ['EMPLOYEE'],
  },
  {
    username: 'employee-marseille1',
    enabled: true,
    emailVerified: true,
    email: 'employee.marseille1@neocivis.cloud',
    lastName: 'Marseille1',
    firstName: 'Employee',
    realmRoles: ['EMPLOYEE'],
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
    const seedId = seeded.length + 1;
    seeded.push({
      seedId,
      username,
      email: typeof u.email === 'string' ? u.email : '',
      firstName: typeof u.firstName === 'string' ? u.firstName : '',
      lastName: typeof u.lastName === 'string' ? u.lastName : '',
      role: pickBaseRole(realmRoles),
      realmRoles,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${username}`,
    });
  }

  return seeded;
}
