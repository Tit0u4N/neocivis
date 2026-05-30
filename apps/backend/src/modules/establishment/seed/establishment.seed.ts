import type { EstablishmentType } from '@repo/contracts/establishment';
import { BIOT_MEDIA_IDS, MARSEILLE_MEDIA_IDS, NICE_MEDIA_IDS } from '@/modules/media/seed/media.seed';

type EstablishmentTemplate = {
  id: string;
  name: string;
  type: EstablishmentType;
  address: string;
  hours: string;
  phone: string;
  mediaId: string;
  fallbackImageUrl: string;
};

/** Stable UUIDs for seeded establishments — referenced by tests and media links. */
export const ESTABLISHMENT_SEED_IDS = {
  nice: {
    mairie: 'e5700001-0000-4000-8000-000000000001',
    ecole: 'e5700001-0000-4000-8000-000000000002',
    mediatheque: 'e5700001-0000-4000-8000-000000000003',
    stade: 'e5700001-0000-4000-8000-000000000004',
  },
  biot: {
    mairie: 'e5700002-0000-4000-8000-000000000001',
    ecole: 'e5700002-0000-4000-8000-000000000002',
  },
  marseille: {
    mairie: 'e5700003-0000-4000-8000-000000000001',
    ecole: 'e5700003-0000-4000-8000-000000000002',
    mediatheque: 'e5700003-0000-4000-8000-000000000003',
  },
} as const;

const TEMPLATES_BY_CITY: Record<string, EstablishmentTemplate[]> = {
  Nice: [
    {
      id: ESTABLISHMENT_SEED_IDS.nice.mairie,
      name: 'Mairie principale',
      type: 'town_hall',
      address: '1 Place du Général de Gaulle',
      hours: 'Lun-Ven 8h-17h',
      phone: '04 93 32 80 00',
      mediaId: NICE_MEDIA_IDS.establishment1,
      fallbackImageUrl: 'https://picsum.photos/seed/nice-hotel-ville/800/500',
    },
    {
      id: ESTABLISHMENT_SEED_IDS.nice.ecole,
      name: 'École primaire Jules Ferry',
      type: 'education',
      address: '12 Rue des Écoles',
      hours: 'Lun-Ven 8h30-16h30',
      phone: '04 93 32 12 34',
      mediaId: NICE_MEDIA_IDS.establishment2,
      fallbackImageUrl: 'https://picsum.photos/seed/nice-ecole/800/500',
    },
    {
      id: ESTABLISHMENT_SEED_IDS.nice.mediatheque,
      name: 'Médiathèque municipale',
      type: 'culture',
      address: '5 Allée des Oliviers',
      hours: 'Mar-Sam 10h-18h',
      phone: '04 93 32 45 67',
      mediaId: NICE_MEDIA_IDS.establishment3,
      fallbackImageUrl: 'https://picsum.photos/seed/nice-mediatheque/800/500',
    },
    {
      id: ESTABLISHMENT_SEED_IDS.nice.stade,
      name: 'Stade municipal',
      type: 'sport',
      address: 'Route de Vence',
      hours: 'Tous les jours 7h-22h',
      phone: '04 93 32 89 10',
      mediaId: NICE_MEDIA_IDS.establishment4,
      fallbackImageUrl: 'https://picsum.photos/seed/nice-stade/800/500',
    },
  ],
  Biot: [
    {
      id: ESTABLISHMENT_SEED_IDS.biot.mairie,
      name: 'Mairie de Biot',
      type: 'town_hall',
      address: '4 Chemin Neuf',
      hours: 'Lun-Ven 8h30-17h',
      phone: '04 93 65 75 01',
      mediaId: BIOT_MEDIA_IDS.establishment1,
      fallbackImageUrl: 'https://picsum.photos/seed/biot-mairie/800/500',
    },
    {
      id: ESTABLISHMENT_SEED_IDS.biot.ecole,
      name: 'École primaire de Biot',
      type: 'education',
      address: '2 Route de la Mer',
      hours: 'Lun-Ven 8h30-16h30',
      phone: '04 93 65 12 34',
      mediaId: BIOT_MEDIA_IDS.establishment2,
      fallbackImageUrl: 'https://picsum.photos/seed/biot-ecole/800/500',
    },
  ],
  Marseille: [
    {
      id: ESTABLISHMENT_SEED_IDS.marseille.mairie,
      name: 'Mairie centrale',
      type: 'town_hall',
      address: 'Quai du Port',
      hours: 'Lun-Ven 8h-17h',
      phone: '04 91 55 11 11',
      mediaId: MARSEILLE_MEDIA_IDS.establishment1,
      fallbackImageUrl: 'https://picsum.photos/seed/marseille-mucem/800/500',
    },
    {
      id: ESTABLISHMENT_SEED_IDS.marseille.ecole,
      name: 'École primaire Les Chartreux',
      type: 'education',
      address: '14 Rue des Chartreux',
      hours: 'Lun-Ven 8h30-16h30',
      phone: '04 91 55 22 33',
      mediaId: MARSEILLE_MEDIA_IDS.establishment2,
      fallbackImageUrl: 'https://picsum.photos/seed/marseille-stade/800/500',
    },
    {
      id: ESTABLISHMENT_SEED_IDS.marseille.mediatheque,
      name: "Médiathèque l'Alcazar",
      type: 'culture',
      address: '58 Cours Belsunce',
      hours: 'Mar-Sam 10h-19h',
      phone: '04 91 55 90 00',
      mediaId: MARSEILLE_MEDIA_IDS.establishment3,
      fallbackImageUrl: 'https://picsum.photos/seed/marseille-alcazar/800/500',
    },
  ],
};

export function getEstablishmentTemplates(cityName: string): EstablishmentTemplate[] {
  return TEMPLATES_BY_CITY[cityName] ?? [];
}
