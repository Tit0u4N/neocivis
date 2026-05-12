import type { CarouselItem, Category } from '@repo/contracts/config';

export function getMockCategories(): Category[] {
  return [
    {
      id: 'alaune',
      attachedPageId: 'page-1',
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
    },
    {
      id: 'pratique',
      attachedPageId: 'page-2',
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
    },
    {
      id: 'urgence',
      attachedPageId: 'page-3',
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
    },
  ];
}

export function getMockCarouselItems(): CarouselItem[] {
  return [
    {
      id: 'carousel-1',
      imageUrl: 'https://picsum.photos/seed/neocivis1/800/400',
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
      id: 'carousel-2',
      imageUrl: 'https://picsum.photos/seed/neocivis2/800/400',
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
      id: 'carousel-3',
      imageUrl: 'https://picsum.photos/seed/neocivis3/800/400',
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
  ];
}
