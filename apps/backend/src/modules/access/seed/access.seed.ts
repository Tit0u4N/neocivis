import type { PermissionKey } from '@repo/contracts';

export type AccessRoleSeed = Readonly<{
  name: string;
  description: string;
  permissions: PermissionKey[];
}>;

/**
 * Rôles par défaut **par ville**, identifiée par le nom (cf. `city.seed.ts`).
 * Chaque ville a au moins 3 rôles distincts pour exercer la démo.
 *
 * On utilise une `Map` (et non un objet) pour pouvoir indexer par nom de
 * ville en PascalCase ("Nice", "Biot", ...) sans déclencher la règle Biome
 * `useNamingConvention`.
 */
export const accessRoleSeedsByCityName: ReadonlyMap<string, readonly AccessRoleSeed[]> = new Map<
  string,
  readonly AccessRoleSeed[]
>([
  [
    'Nice',
    [
      {
        name: 'Modérateur Forum',
        description: 'Gère le forum public de Nice (modération, sanctions).',
        permissions: [
          'FORUM_THREAD_CREATE_PERMISSION',
          'FORUM_THREAD_MODIFY_PERMISSION',
          'FORUM_THREAD_DELETE_PERMISSION',
          'FORUM_THREAD_DELETE_MESSAGE_PERMISSION',
          'FORUM_THREAD_BAN_USER_PERMISSION',
          'FORUM_THREAD_UNBAN_USER_PERMISSION',
        ],
      },
      {
        name: 'Communication',
        description: 'Publie et modifie les annonces et articles de la mairie.',
        permissions: [
          'PAGE_CITY_HALL_MODIFY_PERMISSION',
          'ARTICLE_PUBLISH_PERMISSION',
          'ARTICLE_MODIFY_PERMISSION',
        ],
      },
      {
        name: 'Gestionnaire Signalements',
        description: 'Traite les signalements remontés par les citoyens.',
        permissions: ['SIGNAL_VIEW_PERMISSION', 'SIGNAL_MODIFY_PERMISSION'],
      },
    ],
  ],
  [
    'Biot',
    [
      {
        name: 'Rédacteur',
        description: 'Rédige et publie les articles de Biot.',
        permissions: ['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_MODIFY_PERMISSION', 'ARTICLE_DELETE_PERMISSION'],
      },
      {
        name: 'Référent Signalements',
        description: 'Référent unique des signalements de la ville de Biot.',
        permissions: ['SIGNAL_VIEW_PERMISSION', 'SIGNAL_MODIFY_PERMISSION'],
      },
      {
        name: 'Webmestre',
        description: 'Configure la page mairie et les médias.',
        permissions: ['PAGE_CITY_HALL_MODIFY_PERMISSION', 'MEDIA_UPLOAD_PERMISSION', 'MEDIA_DELETE_PERMISSION'],
      },
    ],
  ],
  [
    'Marseille',
    [
      {
        name: 'Animateur Forum',
        description: 'Anime et modère le forum de Marseille.',
        permissions: [
          'FORUM_THREAD_CREATE_PERMISSION',
          'FORUM_THREAD_MODIFY_PERMISSION',
          'FORUM_THREAD_DELETE_MESSAGE_PERMISSION',
        ],
      },
      {
        name: 'Chargé de communication',
        description: 'Publie articles et annonces officielles.',
        permissions: [
          'ARTICLE_PUBLISH_PERMISSION',
          'ARTICLE_MODIFY_PERMISSION',
          'PAGE_CITY_HALL_MODIFY_PERMISSION',
        ],
      },
      {
        name: 'Modérateur Signalements',
        description: 'Voit, traite et clôture les signalements.',
        permissions: ['SIGNAL_VIEW_PERMISSION', 'SIGNAL_MODIFY_PERMISSION'],
      },
    ],
  ],
]);
