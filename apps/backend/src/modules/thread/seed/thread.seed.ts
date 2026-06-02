import type { ThreadCategory } from '@repo/contracts/thread';

export type ThreadCategorySeedTemplate = Omit<ThreadCategory, 'id' | 'cityId'>;

export const THREAD_CATEGORY_TEMPLATES: ThreadCategorySeedTemplate[] = [
  { emoji: '⚽', label: 'Sport', order: 0 },
  { emoji: '🪓', label: 'Travaux', order: 1 },
  { emoji: '🎓', label: 'École', order: 2 },
  { emoji: '📒', label: 'Culture', order: 3 },
  { emoji: '🌿', label: 'Environnement', order: 4 },
];

export type ThreadSeedTemplate = {
  id: string;
  categoryLabel: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  replies: Array<{
    authorId: string;
    body: string;
    /** Optional seed reactions for demo realism */
    reactions?: Array<{ emoji: string; userIds: string[] }>;
  }>;
};

export const THREAD_SEED_TEMPLATES: ThreadSeedTemplate[] = [
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000001',
    categoryLabel: 'Sport',
    authorId: 'seed-user-marie',
    title: 'Terrains de tennis — entretien',
    body: 'Bonjour, je souhaitais signaler que les terrains de tennis du parc municipal sont en mauvais état depuis quelques semaines. Des fissures sont apparues sur le court n°2 et le filet du court n°1 est déchiré.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 'seed-user-luc',
        body: "Merci pour cette information, c'est très utile pour les habitants du quartier.",
        reactions: [{ emoji: '👍', userIds: ['seed-user-marie', 'seed-user-sophie'] }],
      },
      {
        authorId: 'seed-user-sophie',
        body: 'Je rencontre exactement le même problème de mon côté, il faudrait agir vite.',
      },
    ],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000002',
    categoryLabel: 'École',
    authorId: 'seed-user-jean',
    title: 'Inscriptions cantine 2026',
    body: "Quelles sont les modalités d'inscription pour la cantine scolaire cette année ? Le site ne semble pas à jour.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 'seed-user-emma',
        body: "Tout à fait d'accord avec les remarques précédentes. Merci d'avoir lancé le sujet.",
      },
    ],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000003',
    categoryLabel: 'Culture',
    authorId: 'seed-user-silvie',
    title: 'Concert à la salle des fêtes',
    body: 'Un concert est prévu ce samedi à la salle des fêtes. Le groupe local Azur Band sera en prestation à partir de 20h. Entrée libre dans la limite des places disponibles.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 'seed-user-luc',
        body: "Merci pour cette information, c'est très utile pour les habitants du quartier.",
        reactions: [{ emoji: '❤️', userIds: ['seed-user-silvie'] }],
      },
      {
        authorId: 'seed-user-karim',
        body: 'La mairie devrait vraiment intervenir rapidement à ce sujet.',
      },
      {
        authorId: 'seed-user-sophie',
        body: 'Je rencontre exactement le même problème de mon côté, il faudrait agir vite.',
      },
    ],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000004',
    categoryLabel: 'Travaux',
    authorId: 'seed-user-pierre',
    title: 'Collecte déchets verts',
    body: 'La collecte de déchets verts est-elle maintenue ce vendredi malgré la météo ?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000005',
    categoryLabel: 'Environnement',
    authorId: 'seed-user-anne',
    title: 'Plantation arbres rue centrale',
    body: "Excellente initiative pour la plantation des arbres ! Je suis ravie de voir la ville s'engager dans cette direction écologique.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 'seed-user-emma',
        body: "Tout à fait d'accord avec les remarques précédentes. Merci d'avoir lancé le sujet.",
      },
      {
        authorId: 'seed-user-karim',
        body: 'La mairie devrait vraiment intervenir rapidement à ce sujet.',
        reactions: [
          { emoji: '👍', userIds: ['seed-user-anne', 'seed-user-emma'] },
          { emoji: '🎉', userIds: ['seed-user-pierre'] },
        ],
      },
    ],
  },
];
