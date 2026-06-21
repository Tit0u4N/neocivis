import type { PermissionKey } from '@repo/contracts';

export type PermissionScope = 'SIGNAL' | 'FORUM_THREAD' | 'PAGE_CITY_HALL' | 'ARTICLE' | 'ESTABLISHMENT' | 'MEDIA';

export const PERMISSION_GROUPS: ReadonlyArray<{
  scope: PermissionScope;
  permissions: readonly PermissionKey[];
}> = [
  { scope: 'SIGNAL', permissions: ['SIGNAL_VIEW_PERMISSION', 'SIGNAL_MODIFY_PERMISSION'] },
  {
    scope: 'FORUM_THREAD',
    permissions: [
      'FORUM_THREAD_CREATE_PERMISSION',
      'FORUM_THREAD_DELETE_PERMISSION',
      'FORUM_THREAD_MODIFY_PERMISSION',
      'FORUM_THREAD_DELETE_MESSAGE_PERMISSION',
      'FORUM_THREAD_BAN_USER_PERMISSION',
      'FORUM_THREAD_UNBAN_USER_PERMISSION',
    ],
  },
  { scope: 'PAGE_CITY_HALL', permissions: ['PAGE_CITY_HALL_MODIFY_PERMISSION'] },
  {
    scope: 'ARTICLE',
    permissions: ['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_MODIFY_PERMISSION', 'ARTICLE_DELETE_PERMISSION'],
  },
  {
    scope: 'ESTABLISHMENT',
    permissions: [
      'ESTABLISHMENT_CREATE_PERMISSION',
      'ESTABLISHMENT_MODIFY_PERMISSION',
      'ESTABLISHMENT_DELETE_PERMISSION',
    ],
  },
  { scope: 'MEDIA', permissions: ['MEDIA_UPLOAD_PERMISSION', 'MEDIA_DELETE_PERMISSION'] },
];
