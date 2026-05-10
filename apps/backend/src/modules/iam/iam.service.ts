export type IamUserProfile = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type IamUser = IamUserProfile & {
  id: string;
  username?: string;
};

export interface IAMService {
  /**
   * Retourne les infos de profil d'un utilisateur (si disponibles).
   * Doit retourner `null` si le service IAM n'est pas configuré ou si l'utilisateur n'est pas trouvable.
   */
  getUserProfileById(userId: string): Promise<IamUserProfile | null>;

  /**
   * Résout un user Keycloak à partir de son username.
   * Retourne `null` si non configuré / introuvable.
   */
  getUserByUsername(username: string): Promise<IamUser | null>;

  /**
   * Crée un utilisateur Keycloak avec des realm roles.
   * Doit throw si non configuré / échec Keycloak (on bloque).
   */
  createUser(input: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    realmRoles: string[];
  }): Promise<IamUser>;

  /**
   * Supprime un utilisateur Keycloak (coupe l'accès).
   * Doit throw si non configuré / échec Keycloak (on bloque).
   */
  deleteUser(userId: string): Promise<void>;
}
