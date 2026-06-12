import type { MediaImageLink } from '@repo/contracts/media';

export type MediaSeedTemplate = {
  id: string;
  title: string;
  sourceUrl: string;
  filename: string;
  mimeType: string;
  links?: MediaImageLink[];
};

/** Fixed Nice media ids referenced by article/config/establishment seeders. */
export const NICE_MEDIA_IDS = {
  carousel1: 'a1000001-0000-4000-8000-000000000001',
  carousel2: 'a1000001-0000-4000-8000-000000000002',
  carousel3: 'a1000001-0000-4000-8000-000000000003',
  articleCover1: 'a1000001-0000-4000-8000-000000000004',
  articleCover2: 'a1000001-0000-4000-8000-000000000005',
  articleInline: 'a1000001-0000-4000-8000-000000000006',
  establishment1: 'a1000001-0000-4000-8000-000000000007',
  galleryExtra: 'a1000001-0000-4000-8000-000000000008',
  establishment2: 'a1000001-0000-4000-8000-000000000009',
  establishment3: 'a1000001-0000-4000-8000-000000000010',
  establishment4: 'a1000001-0000-4000-8000-000000000011',
} as const;

export const BIOT_MEDIA_IDS = {
  establishment1: 'b2000002-0000-4000-8000-000000000005',
  establishment2: 'b2000002-0000-4000-8000-000000000006',
} as const;

export const MARSEILLE_MEDIA_IDS = {
  establishment1: 'c3000003-0000-4000-8000-000000000004',
  establishment2: 'c3000003-0000-4000-8000-000000000006',
  establishment3: 'c3000003-0000-4000-8000-000000000007',
} as const;

export const mediaSeedsByCityName = new Map<string, MediaSeedTemplate[]>([
  [
    'Nice',
    [
      {
        id: NICE_MEDIA_IDS.carousel1,
        title: 'Promenade des Anglais — Carousel',
        sourceUrl: 'https://picsum.photos/seed/nice-carousel-1/800/400',
        filename: 'nice-carousel-1.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.carousel2,
        title: 'Vieux-Nice — Carousel',
        sourceUrl: 'https://picsum.photos/seed/nice-carousel-2/800/400',
        filename: 'nice-carousel-2.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.carousel3,
        title: 'Carnaval de Nice — Carousel',
        sourceUrl: 'https://picsum.photos/seed/nice-carousel-3/800/400',
        filename: 'nice-carousel-3.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.articleCover1,
        title: 'Bienvenue — Couverture article',
        sourceUrl: 'https://picsum.photos/seed/nice-cover-1/1200/630',
        filename: 'nice-cover-1.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.articleCover2,
        title: 'Travaux voirie — Couverture article',
        sourceUrl: 'https://picsum.photos/seed/nice-cover-2/800/400',
        filename: 'nice-cover-2.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.articleInline,
        title: 'Illustration article',
        sourceUrl: 'https://picsum.photos/seed/nice-inline/600/400',
        filename: 'nice-inline.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.establishment1,
        title: 'Hôtel de Ville de Nice',
        sourceUrl: 'https://picsum.photos/seed/nice-hotel-ville/800/500',
        filename: 'nice-hotel-ville.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.galleryExtra,
        title: 'Marché du Cours Saleya',
        sourceUrl: 'https://picsum.photos/seed/nice-marche/400/300',
        filename: 'nice-marche-thumb.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.establishment2,
        title: 'École Jules Ferry — Nice',
        sourceUrl: 'https://picsum.photos/seed/nice-ecole/800/500',
        filename: 'nice-ecole.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.establishment3,
        title: 'Médiathèque municipale — Nice',
        sourceUrl: 'https://picsum.photos/seed/nice-mediatheque/800/500',
        filename: 'nice-mediatheque.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: NICE_MEDIA_IDS.establishment4,
        title: 'Stade municipal — Nice',
        sourceUrl: 'https://picsum.photos/seed/nice-stade/800/500',
        filename: 'nice-stade.jpg',
        mimeType: 'image/jpeg',
      },
    ],
  ],
  [
    'Biot',
    [
      {
        id: 'b2000002-0000-4000-8000-000000000001',
        title: 'Village de Biot — Carousel',
        sourceUrl: 'https://picsum.photos/seed/biot-carousel/800/400',
        filename: 'biot-carousel.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'b2000002-0000-4000-8000-000000000002',
        title: 'Village de Biot — Couverture',
        sourceUrl: 'https://picsum.photos/seed/biot-cover/1200/630',
        filename: 'biot-cover.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'b2000002-0000-4000-8000-000000000003',
        title: 'Musée Fernand Léger',
        sourceUrl: 'https://picsum.photos/seed/biot-leger/800/500',
        filename: 'biot-leger.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'b2000002-0000-4000-8000-000000000004',
        title: 'Verrerie de Biot — Vignette',
        sourceUrl: 'https://picsum.photos/seed/biot-verrerie/400/300',
        filename: 'biot-verrerie.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: BIOT_MEDIA_IDS.establishment1,
        title: 'Mairie de Biot',
        sourceUrl: 'https://picsum.photos/seed/biot-mairie/800/500',
        filename: 'biot-mairie.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: BIOT_MEDIA_IDS.establishment2,
        title: 'École primaire — Biot',
        sourceUrl: 'https://picsum.photos/seed/biot-ecole/800/500',
        filename: 'biot-ecole.jpg',
        mimeType: 'image/jpeg',
      },
    ],
  ],
  [
    'Marseille',
    [
      {
        id: 'c3000003-0000-4000-8000-000000000001',
        title: 'Vieux-Port — Carousel',
        sourceUrl: 'https://picsum.photos/seed/marseille-carousel/800/400',
        filename: 'marseille-carousel.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'c3000003-0000-4000-8000-000000000002',
        title: 'Notre-Dame de la Garde — Couverture',
        sourceUrl: 'https://picsum.photos/seed/marseille-cover/1200/630',
        filename: 'marseille-cover.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'c3000003-0000-4000-8000-000000000003',
        title: 'Calanques — Inline',
        sourceUrl: 'https://picsum.photos/seed/marseille-calanques/600/400',
        filename: 'marseille-calanques.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'c3000003-0000-4000-8000-000000000004',
        title: 'MuCEM — Établissement',
        sourceUrl: 'https://picsum.photos/seed/marseille-mucem/800/500',
        filename: 'marseille-mucem.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: 'c3000003-0000-4000-8000-000000000005',
        title: 'Vieux-Port — Vignette',
        sourceUrl: 'https://picsum.photos/seed/marseille-vieux-port/400/300',
        filename: 'marseille-vieux-port.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: MARSEILLE_MEDIA_IDS.establishment2,
        title: 'Stade Vélodrome — Marseille',
        sourceUrl: 'https://picsum.photos/seed/marseille-stade/800/500',
        filename: 'marseille-stade.jpg',
        mimeType: 'image/jpeg',
      },
      {
        id: MARSEILLE_MEDIA_IDS.establishment3,
        title: "Médiathèque l'Alcazar — Marseille",
        sourceUrl: 'https://picsum.photos/seed/marseille-alcazar/800/500',
        filename: 'marseille-alcazar.jpg',
        mimeType: 'image/jpeg',
      },
    ],
  ],
]);
