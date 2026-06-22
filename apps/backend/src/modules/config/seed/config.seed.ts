import type { CarouselItem, Category } from '@repo/contracts/config';
import { NICE_MEDIA_IDS } from '@/modules/media/seed/media.seed';

export function getMockCategories(): Category[] {
  return [
    {
      id: 'alaune',
      icon: 'Star',
      color: '#F42500',
      row: 0,
      col: 0,
      colSpan: 2,
      translations: [
        { locale: 'fr', name: 'À la Une' },
        { locale: 'en', name: 'Featured' },
        { locale: 'de', name: 'Aktuell' },
        { locale: 'it', name: 'In primo piano' },
      ],
      link: {
        type: 'General',
      },
    },
    {
      id: 'pratique',
      icon: 'Info',
      color: '#0C8CE9',
      row: 0,
      col: 2,
      translations: [
        { locale: 'fr', name: 'Pratique' },
        { locale: 'en', name: 'Practical' },
        { locale: 'de', name: 'Praktisch' },
        { locale: 'it', name: 'Pratico' },
      ],
      link: {
        type: 'Forum',
      },
    },
    {
      id: 'urgence',
      icon: 'TriangleAlert',
      color: '#D97706',
      row: 1,
      col: 0,
      translations: [
        { locale: 'fr', name: 'Urgence' },
        { locale: 'en', name: 'Emergency' },
        { locale: 'de', name: 'Notfall' },
        { locale: 'it', name: 'Emergenza' },
      ],
      link: {
        type: 'Reports',
      },
    },
    {
      id: 'travaux',
      icon: 'Wrench',
      color: '#64748B',
      row: 1,
      col: 1,
      colSpan: 2,
      translations: [
        { locale: 'fr', name: 'Travaux' },
        { locale: 'en', name: 'Works' },
        { locale: 'de', name: 'Baustellen' },
        { locale: 'it', name: 'Lavori' },
      ],
      link: {
        type: 'Articles',
      },
    },
    {
      id: 'sondage',
      icon: 'BarChart2',
      color: '#16A34A',
      row: 2,
      col: 0,
      translations: [
        { locale: 'fr', name: 'Sondage' },
        { locale: 'en', name: 'Survey' },
        { locale: 'de', name: 'Umfrage' },
        { locale: 'it', name: 'Sondaggio' },
      ],
      link: {
        type: 'ExternalURL',
        value: 'https://example.com/sondage',
      },
    },
    {
      id: 'divers',
      icon: 'Globe',
      color: '#7C3AED',
      row: 2,
      col: 1,
      translations: [
        { locale: 'fr', name: 'Divers' },
        { locale: 'en', name: 'Miscellaneous' },
        { locale: 'de', name: 'Sonstiges' },
        { locale: 'it', name: 'Varie' },
      ],
      link: {
        type: 'ArticlePage',
        value: '22222222-2222-2222-2222-222222222222',
      },
    },
  ];
}

/** Carousel item seed template (imageUrl resolved from media at seed time). */
export type CarouselSeedTemplate = {
  id: string;
  mediaId: string;
  order: number;
  translations: CarouselItem['translations'];
};

export const carouselSeedsByCityName = new Map<string, CarouselSeedTemplate[]>([
  [
    'Nice',
    [
      {
        id: 'c1000001-0000-4000-8000-000000000001',
        mediaId: NICE_MEDIA_IDS.carousel1,
        order: 0,
        translations: [
          {
            locale: 'fr',
            title: 'Bienvenue sur NeoCivis',
            description: 'Votre portail municipal en ligne',
            tag: 'Infos',
          },
          {
            locale: 'en',
            title: 'Welcome to NeoCivis',
            description: 'Your online municipal portal',
            tag: 'Info',
          },
          {
            locale: 'de',
            title: 'Willkommen bei NeoCivis',
            description: 'Ihr kommunales Online-Portal',
            tag: 'Info',
          },
          {
            locale: 'it',
            title: 'Benvenuto su NeoCivis',
            description: 'Il tuo portale comunale online',
            tag: 'Info',
          },
        ],
      },
      {
        id: 'c1000001-0000-4000-8000-000000000002',
        mediaId: NICE_MEDIA_IDS.carousel2,
        order: 1,
        translations: [
          {
            locale: 'fr',
            title: 'Travaux rue de la Paix',
            description: 'Du 15 au 30 janvier — circulation perturbée',
            tag: 'Travaux',
          },
          {
            locale: 'en',
            title: 'Works on Rue de la Paix',
            description: 'Jan 15–30 — traffic disrupted',
            tag: 'Works',
          },
          {
            locale: 'de',
            title: 'Bauarbeiten Rue de la Paix',
            description: '15.–30. Januar — Verkehrsbehinderungen',
            tag: 'Baustellen',
          },
          {
            locale: 'it',
            title: 'Lavori in Rue de la Paix',
            description: '15–30 gennaio — traffico perturbato',
            tag: 'Lavori',
          },
        ],
      },
      {
        id: 'c1000001-0000-4000-8000-000000000003',
        mediaId: NICE_MEDIA_IDS.carousel3,
        order: 2,
        translations: [
          {
            locale: 'fr',
            title: 'Nouvelle collecte des déchets',
            description: 'Nouveau calendrier de ramassage dès février',
            tag: 'Pratique',
          },
          {
            locale: 'en',
            title: 'New waste collection schedule',
            description: 'New pickup schedule starting February',
            tag: 'Practical',
          },
          {
            locale: 'de',
            title: 'Neue Müllabfuhr',
            description: 'Neuer Abholplan ab Februar',
            tag: 'Praktisch',
          },
          {
            locale: 'it',
            title: 'Nuovo calendario raccolta rifiuti',
            description: 'Nuovo calendario di raccolta da febbraio',
            tag: 'Pratico',
          },
        ],
      },
    ],
  ],
  [
    'Biot',
    [
      {
        id: 'c2000002-0000-4000-8000-000000000001',
        mediaId: 'b2000002-0000-4000-8000-000000000001',
        order: 0,
        translations: [
          {
            locale: 'fr',
            title: 'Bienvenue à Biot',
            description: 'Découvrez le village et ses ateliers',
            tag: 'Infos',
          },
          {
            locale: 'en',
            title: 'Welcome to Biot',
            description: 'Discover the village and its workshops',
            tag: 'Info',
          },
        ],
      },
      {
        id: 'c2000002-0000-4000-8000-000000000002',
        mediaId: 'b2000002-0000-4000-8000-000000000003',
        order: 1,
        translations: [
          {
            locale: 'fr',
            title: 'Musée Fernand Léger',
            description: 'Expositions et événements culturels',
            tag: 'Culture',
          },
          {
            locale: 'en',
            title: 'Fernand Léger Museum',
            description: 'Exhibitions and cultural events',
            tag: 'Culture',
          },
        ],
      },
    ],
  ],
  [
    'Marseille',
    [
      {
        id: 'c3000003-0000-4000-8000-000000000001',
        mediaId: 'c3000003-0000-4000-8000-000000000001',
        order: 0,
        translations: [
          {
            locale: 'fr',
            title: 'Vieux-Port de Marseille',
            description: 'Actualités et informations pratiques',
            tag: 'Infos',
          },
          {
            locale: 'en',
            title: 'Marseille Old Port',
            description: 'News and practical information',
            tag: 'Info',
          },
        ],
      },
      {
        id: 'c3000003-0000-4000-8000-000000000002',
        mediaId: 'c3000003-0000-4000-8000-000000000002',
        order: 1,
        translations: [
          {
            locale: 'fr',
            title: 'Notre-Dame de la Garde',
            description: 'Patrimoine et visites',
            tag: 'Patrimoine',
          },
          {
            locale: 'en',
            title: 'Notre-Dame de la Garde',
            description: 'Heritage and visits',
            tag: 'Heritage',
          },
        ],
      },
      {
        id: 'c3000003-0000-4000-8000-000000000003',
        mediaId: 'c3000003-0000-4000-8000-000000000003',
        order: 2,
        translations: [
          {
            locale: 'fr',
            title: 'Les Calanques',
            description: 'Préparez votre sortie nature',
            tag: 'Pratique',
          },
          {
            locale: 'en',
            title: 'The Calanques',
            description: 'Plan your nature outing',
            tag: 'Practical',
          },
        ],
      },
    ],
  ],
]);

export function getCarouselSeedsForCity(cityName: string): CarouselSeedTemplate[] {
  return carouselSeedsByCityName.get(cityName) ?? [];
}

export function cityNamesWithCarouselSeed(): string[] {
  return [...carouselSeedsByCityName.keys()];
}
