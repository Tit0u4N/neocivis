import type { CityPublicDto } from '../city/city.schema';
import type { PermissionKey } from '../permission/permission.schema';
import type { RoleSummaryDto } from '../role/role.schema';

export type BaseUserRole = 'ADMIN' | 'EMPLOYEE' | 'CITIZEN';

/** Champs publics pour listes / profils légers (ex. `/user/by-ids`). */
export type UserPublicDto = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
};

/** Profil courant authentifié (ex. `/user/me`) — plus de champs que `UserPublicDto`. */
export type UserMeDto = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: BaseUserRole;
  profilePictureUrl: string | null;

  /**
   * Pour ADMIN / EMPLOYEE: la city unique dont l'utilisateur dépend.
   * Pour CITIZEN: undefined.
   */
  city?: CityPublicDto;

  /**
   * Pour CITIZEN: la liste des cities dont l'utilisateur est membre.
   * Pour ADMIN / EMPLOYEE: vide (par défaut).
   */
  memberships: CityPublicDto[];

  /**
   * Permissions effectives de l'utilisateur dans le scope courant.
   * - ADMIN: catalogue complet (bypass).
   * - EMPLOYEE: union des permissions des rôles affectés dans sa city.
   * - CITIZEN: tableau vide (le système RBAC ne s'applique pas).
   */
  permissions: PermissionKey[];

  /**
   * Rôles attribués à l'utilisateur (résumé id + name uniquement, pas de
   * description ni de permissions — le détail est admin-only).
   * - ADMIN: vide (l'admin a un bypass implicite, pas de rôles assignés).
   * - EMPLOYEE: rôles qui lui sont attribués dans sa city.
   * - CITIZEN: vide.
   */
  roles: RoleSummaryDto[];
};
