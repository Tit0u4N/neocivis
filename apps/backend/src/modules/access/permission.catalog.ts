import type { PermissionKey } from '@repo/contracts';

/**
 * Catalogue figé des permissions de l'application (clés uniquement).
 * - Source de vérité : ce fichier.
 * - Aucune création/suppression dynamique.
 * - Tout ajout/suppression nécessite une modification du code (+ revue/PR).
 *
 * NB : si tu ajoutes une clé ici, ajoute-la également dans le `z.enum` de
 * `@repo/contracts/permission` pour rester cohérent côté frontend.
 */
export const PERMISSION_CATALOG: readonly PermissionKey[] = [
  'SIGNAL_VIEW_PERMISSION',
  'SIGNAL_MODIFY_PERMISSION',
  'FORUM_THREAD_CREATE_PERMISSION',
  'FORUM_THREAD_DELETE_PERMISSION',
  'FORUM_THREAD_MODIFY_PERMISSION',
  'FORUM_THREAD_DELETE_MESSAGE_PERMISSION',
  'FORUM_THREAD_BAN_USER_PERMISSION',
  'FORUM_THREAD_UNBAN_USER_PERMISSION',
  'PAGE_CITY_HALL_MODIFY_PERMISSION',
  'ARTICLE_PUBLISH_PERMISSION',
  'ARTICLE_MODIFY_PERMISSION',
  'ARTICLE_DELETE_PERMISSION',
  'ESTABLISHMENT_CREATE_PERMISSION',
  'ESTABLISHMENT_MODIFY_PERMISSION',
  'ESTABLISHMENT_DELETE_PERMISSION',
  'MEDIA_UPLOAD_PERMISSION',
  'MEDIA_DELETE_PERMISSION',
] as const satisfies readonly PermissionKey[];

export const PERMISSION_KEYS: readonly PermissionKey[] = [...PERMISSION_CATALOG];
const PERMISSION_KEY_SET = new Set<string>(PERMISSION_KEYS);

export function isValidPermissionKey(key: string): key is PermissionKey {
  return PERMISSION_KEY_SET.has(key);
}
