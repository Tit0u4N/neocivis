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
};
