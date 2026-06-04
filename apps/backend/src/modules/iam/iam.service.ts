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
  /**
   * Crée un utilisateur Keycloak sans mot de passe et envoie un e-mail
   * pour que l'utilisateur définisse son mot de passe (UPDATE_PASSWORD).
   */
  createUser(input: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    realmRoles: string[];
  }): Promise<IamUser>;

  /**
   * Supprime un utilisateur Keycloak (coupe l'accès).
   * Doit throw si non configuré / échec Keycloak (on bloque).
   */
  deleteUser(userId: string): Promise<void>;

  /**
   * Assigne des realm roles à un utilisateur existant.
   * No-op si non configuré. Throw si Keycloak échoue.
   */
  assignRealmRoles(userId: string, realmRoles: string[]): Promise<void>;

  /**
   * Vérifie que l'utilisateur n'existe plus dans Keycloak (404 par id ou recherche username vide).
   * Retourne `true` si IAM non configuré (impossible de vérifier).
   */
  isUserAbsentFromKeycloak(userId: string, username?: string): Promise<boolean>;

  /**
   * Met à jour le profil d'un utilisateur dans Keycloak (Admin API).
   * Seuls les champs fournis (non `undefined`) sont mis à jour.
   * Throw si non configuré / échec Keycloak.
   */
  updateUserProfile(userId: string, input: Partial<IamUserProfile>): Promise<void>;

  /**
   * Envoie un e-mail `UPDATE_PASSWORD` à l'utilisateur via Keycloak.
   * `clientId` détermine la variable `client` dans le template FTL (branding citizen vs town-hall).
   * Throw si non configuré / échec Keycloak.
   */
  sendPasswordResetEmail(userId: string, clientId: string): Promise<void>;
}
