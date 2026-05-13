import { randomUUID } from 'node:crypto';
import type { MediaImage } from '@repo/contracts/media';

type MediaSeedEntry = Omit<MediaImage, 'id' | 'cityId' | 'createdAt'>;

export const mediaSeedsByCityName = new Map<string, MediaSeedEntry[]>([
  [
    'Nice',
    [
      {
        title: 'Promenade des Anglais',
        url: 'https://picsum.photos/seed/nice-promenade/800/500',
        storagePath: 'nice/promenade-des-anglais.jpg',
        links: [],
      },
      {
        title: 'Vieux-Nice — Marché du Cours Saleya',
        url: 'https://picsum.photos/seed/nice-marche/800/500',
        storagePath: 'nice/vieux-nice-marche.jpg',
        links: [],
      },
      {
        title: 'Carnaval de Nice 2026',
        url: 'https://picsum.photos/seed/nice-carnaval/800/500',
        storagePath: 'nice/carnaval-2026.jpg',
        links: [{ idLink: randomUUID(), type: 'carousel', title: 'Carnaval 2026' }],
      },
      {
        title: 'Hôtel de Ville de Nice',
        url: 'https://picsum.photos/seed/nice-hotel-ville/800/500',
        storagePath: 'nice/hotel-de-ville.jpg',
        links: [{ idLink: randomUUID(), type: 'establishments', title: 'Mairie de Nice' }],
      },
    ],
  ],
  [
    'Biot',
    [
      {
        title: 'Village de Biot',
        url: 'https://picsum.photos/seed/biot-village/800/500',
        storagePath: 'biot/village.jpg',
        links: [],
      },
      {
        title: 'Musée Fernand Léger',
        url: 'https://picsum.photos/seed/biot-leger/800/500',
        storagePath: 'biot/musee-leger.jpg',
        links: [{ idLink: randomUUID(), type: 'establishments', title: 'Musée Fernand Léger' }],
      },
      {
        title: 'Verrerie de Biot',
        url: 'https://picsum.photos/seed/biot-verrerie/800/500',
        storagePath: 'biot/verrerie.jpg',
        links: [{ idLink: randomUUID(), type: 'carousel', title: 'Artisanat local' }],
      },
    ],
  ],
  [
    'Marseille',
    [
      {
        title: 'Vieux-Port de Marseille',
        url: 'https://picsum.photos/seed/marseille-vieux-port/800/500',
        storagePath: 'marseille/vieux-port.jpg',
        links: [{ idLink: randomUUID(), type: 'carousel', title: 'Vieux-Port' }],
      },
      {
        title: 'Notre-Dame de la Garde',
        url: 'https://picsum.photos/seed/marseille-bonne-mere/800/500',
        storagePath: 'marseille/notre-dame-garde.jpg',
        links: [],
      },
      {
        title: 'Calanques de Marseille',
        url: 'https://picsum.photos/seed/marseille-calanques/800/500',
        storagePath: 'marseille/calanques.jpg',
        links: [{ idLink: randomUUID(), type: 'articles', title: 'Parc national des Calanques' }],
      },
      {
        title: 'MuCEM',
        url: 'https://picsum.photos/seed/marseille-mucem/800/500',
        storagePath: 'marseille/mucem.jpg',
        links: [{ idLink: randomUUID(), type: 'establishments', title: 'MuCEM' }],
      },
    ],
  ],
]);

export function buildMediaSeed(cityId: string, entries: MediaSeedEntry[]): MediaImage[] {
  return entries.map((entry) => ({
    ...entry,
    id: randomUUID(),
    cityId,
    createdAt: new Date().toISOString(),
  }));
}
