import type { Establishment } from '@repo/contracts/establishment';

export function getMockEstablishments(): Establishment[] {
  return [
    {
      id: 'est-1',
      name: 'Mairie principale',
      type: 'mairie',
      address: '1 Place du Général de Gaulle',
      hours: 'Lun-Ven 8h-17h',
      phone: '04 93 32 80 00',
      imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',
    },
    {
      id: 'est-2',
      name: 'École primaire Jules Ferry',
      type: 'education',
      address: '12 Rue des Écoles',
      hours: 'Lun-Ven 8h30-16h30',
      phone: '04 93 32 12 34',
      imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
    },
    {
      id: 'est-3',
      name: 'Médiathèque municipale',
      type: 'culture',
      address: '5 Allée des Oliviers',
      hours: 'Mar-Sam 10h-18h',
      phone: '04 93 32 45 67',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80',
    },
    {
      id: 'est-4',
      name: 'Stade municipal',
      type: 'sport',
      address: 'Route de Vence',
      hours: 'Tous les jours 7h-22h',
      phone: '04 93 32 89 10',
      imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80',
    },
  ];
}
