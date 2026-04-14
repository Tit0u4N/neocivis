import type { Article } from '@repo/contracts/article';

export function getMockArticles(): Article[] {
  return [
    {
      id: '11111111-1111-1111-1111-111111111111',
      translations: [
        {
          locale: 'fr',
          title: 'Bienvenue dans notre ville',
          description: 'Découvrez les dernières actualités de notre commune.',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                children: [{ text: 'Notre ville est heureuse de vous accueillir sur ce nouveau portail citoyen.' }],
              },
            ],
          },
        },
        {
          locale: 'en',
          title: 'Welcome to our city',
          description: 'Discover the latest news from our municipality.',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                children: [{ text: 'Our city is pleased to welcome you to this new citizen portal.' }],
              },
            ],
          },
        },
      ],
      coverImageUrl: 'https://picsum.photos/seed/city/800/400',
      status: 'published',
      publishedAt: '2026-01-15T10:00:00.000Z',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
      authorId: 'user-municipality-1',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      translations: [
        {
          locale: 'fr',
          title: 'Travaux de voirie — Rue du Moulin',
          description: 'Informations sur les travaux en cours.',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Des travaux de rénovation débutent le 1er février 2026 rue du Moulin. Circulation alternée.',
                  },
                ],
              },
            ],
          },
        },
      ],
      coverImageUrl: 'https://picsum.photos/seed/road/800/400',
      status: 'published',
      publishedAt: '2026-01-20T09:00:00.000Z',
      createdAt: '2026-01-18T14:00:00.000Z',
      updatedAt: '2026-01-20T09:00:00.000Z',
      authorId: 'user-municipality-1',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      translations: [
        {
          locale: 'fr',
          title: 'Conseil municipal — Compte-rendu de janvier',
          description: 'Résumé des décisions prises lors du conseil du 25 janvier.',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                children: [
                  { text: "Le conseil municipal s'est réuni le 25 janvier 2026 et a voté le budget primitif 2026." },
                ],
              },
            ],
          },
        },
        {
          locale: 'de',
          title: 'Gemeinderat — Bericht Januar',
          description: 'Zusammenfassung der Beschlüsse der Sitzung vom 25. Januar.',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                children: [
                  { text: 'Der Gemeinderat traf sich am 25. Januar 2026 und verabschiedete den Haushalt 2026.' },
                ],
              },
            ],
          },
        },
      ],
      status: 'published',
      publishedAt: '2026-01-26T11:00:00.000Z',
      createdAt: '2026-01-26T10:00:00.000Z',
      updatedAt: '2026-01-26T11:00:00.000Z',
      authorId: 'user-municipality-2',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      translations: [
        {
          locale: 'fr',
          title: 'Fête de la musique 2026 — Appel à candidature',
          description: 'Vous êtes musicien·ne ? Rejoignez la fête !',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                children: [{ text: 'Inscrivez-vous avant le 30 avril pour participer à la Fête de la musique 2026.' }],
              },
            ],
          },
        },
      ],
      status: 'draft',
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-03-15T14:00:00.000Z',
      authorId: 'user-municipality-1',
    },
  ];
}

