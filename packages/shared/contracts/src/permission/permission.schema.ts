import { z } from 'zod';

/**
 * Clés des permissions du catalogue figé.
 * Aucune nouvelle permission ne peut être créée à l'exécution :
 * la liste est définie côté backend dans `permission.catalog.ts`.
 */
export const PermissionKey = z.enum([
  'SIGNAL_VIEW_PERMISSION',
  'SIGNAL_CREATE_PERMISSION',
  'SIGNAL_MODIFY_PERMISSION',
  'FORUM_THREAD_CREATE_PERMISSION',
  'FORUM_THREAD_DELETE_PERMISSION',
  'FORUM_THREAD_MODIFY_PERMISSION',
  'FORUM_THREAD_DELETE_MESSAGE_PERMISSION',
  'FORUM_THREAD_BAN_USER_PERMISSION',
  'FORUM_THREAD_UNBAN_USER_PERMISSION',
  'PAGE_CITY_HALL_MODIFY_PERMISSION',
  'PAGE_CITY_HALL_ANNOUNCE_PERMISSION',
  'NOTIFICATION_SEND_PERMISSION',
  'WEBHOOK_PERMISSION',
  'ARTICLE_PUBLISH_PERMISSION',
  'ARTICLE_MODIFY_PERMISSION',
  'ARTICLE_DELETE_PERMISSION',
]);
export type PermissionKey = z.infer<typeof PermissionKey>;

/** Catalogue API : clé uniquement (libellés gérés côté front). */
export const PermissionDto = z.object({
  key: PermissionKey,
});
export type PermissionDto = z.infer<typeof PermissionDto>;
