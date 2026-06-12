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
  authorId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  replies: Array<{
    authorId: number;
    body: string;
    reactions?: Array<{ emoji: string; userIds: number[] }>;
  }>;
};

// Mapping to seeded user numeric IDs (from user.seed.ts seedId):
// 1=citizen1, 2=citizen2, 3=citizen3, 4=admin-nice, 5=admin-biot, 6=admin-marseille,
// 7=employee-nice1, 8=employee-biot1, 9=employee-marseille1
export const THREAD_SEED_TEMPLATES: ThreadSeedTemplate[] = [
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000001',
    categoryLabel: 'Sport',
    authorId: 1,
    title: 'Terrains de tennis — entretien',
    body: 'Bonjour, je souhaitais signaler que les terrains de tennis du parc municipal sont en mauvais état depuis quelques semaines. Des fissures sont apparues sur le court n°2 et le filet du court n°1 est déchiré.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 2,
        body: "Merci pour cette information, c'est très utile pour les habitants du quartier.",
        reactions: [{ emoji: '👍', userIds: [1, 3] }],
      },
      {
        authorId: 3,
        body: 'Je rencontre exactement le même problème de mon côté, il faudrait agir vite.',
      },
    ],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000002',
    categoryLabel: 'École',
    authorId: 7,
    title: 'Inscriptions cantine 2026',
    body: "Quelles sont les modalités d'inscription pour la cantine scolaire cette année ? Le site ne semble pas à jour.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 8,
        body: "Tout à fait d'accord avec les remarques précédentes. Merci d'avoir lancé le sujet.",
      },
    ],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000003',
    categoryLabel: 'Culture',
    authorId: 4,
    title: 'Concert à la salle des fêtes',
    body: 'Un concert est prévu ce samedi à la salle des fêtes. Le groupe local Azur Band sera en prestation à partir de 20h. Entrée libre dans la limite des places disponibles.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 2,
        body: "Merci pour cette information, c'est très utile pour les habitants du quartier.",
        reactions: [{ emoji: '❤️', userIds: [4] }],
      },
      {
        authorId: 9,
        body: 'La mairie devrait vraiment intervenir rapidement à ce sujet.',
      },
      {
        authorId: 3,
        body: 'Je rencontre exactement le même problème de mon côté, il faudrait agir vite.',
      },
    ],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000004',
    categoryLabel: 'Travaux',
    authorId: 5,
    title: 'Collecte déchets verts',
    body: 'La collecte de déchets verts est-elle maintenue ce vendredi malgré la météo ?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [],
  },
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000005',
    categoryLabel: 'Environnement',
    authorId: 6,
    title: 'Plantation arbres rue centrale',
    body: "Excellente initiative pour la plantation des arbres ! Je suis ravie de voir la ville s'engager dans cette direction écologique.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        authorId: 8,
        body: "Tout à fait d'accord avec les remarques précédentes. Merci d'avoir lancé le sujet.",
      },
      {
        authorId: 9,
        body: 'La mairie devrait vraiment intervenir rapidement à ce sujet.',
        reactions: [
          { emoji: '👍', userIds: [6, 8] },
          { emoji: '🎉', userIds: [5] },
        ],
      },
    ],
  },
];
