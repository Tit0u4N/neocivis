import type { CityPublicDto } from '../city/city.schema';

export type BaseUserRole = 'ADMIN' | 'EMPLOYEE' | 'CITIZEN';

/** Champs publics pour listes / profils légers (ex. `/user/by-ids`). */
export type UserPublicDto = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

/** Profil courant authentifié (ex. `/user/me`) — plus de champs que `UserPublicDto`. */
export type UserMeDto = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: BaseUserRole;

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
};
