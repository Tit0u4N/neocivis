import type { Report } from '@repo/contracts/report';

const DEV_AUTHOR_ID = 'dev-citizen-001';

export function getMockReports(authorId: string = DEV_AUTHOR_ID): Report[] {
  return [
    {
      id: '11111111-0001-0001-0001-000000000001',
      authorId,
      title: 'Lampadaire défectueux',
      type: 'Éclairage public',
      status: 'progress',
      desc: 'Le lampadaire au coin de la rue Pasteur clignote depuis plusieurs nuits et éclaire mal le trottoir.',
      location: { latitude: 43.2965, longitude: 5.3698 },
      createdAt: '2026-04-12T10:00:00.000Z',
      updatedAt: '2026-04-14T09:00:00.000Z',
    },
    {
      id: '11111111-0002-0002-0002-000000000002',
      authorId,
      title: 'Tag sur abribus',
      type: 'Propreté',
      status: 'resolved',
      desc: "Des tags ont été apposés sur la vitre et le cadre de l'abribus de la place centrale.",
      location: { latitude: 43.2967, longitude: 5.3712 },
      createdAt: '2026-04-08T08:30:00.000Z',
      updatedAt: '2026-04-11T14:00:00.000Z',
      resolvedAt: '2026-04-11T14:00:00.000Z',
    },
    {
      id: '11111111-0003-0003-0003-000000000003',
      authorId,
      title: 'Banc cassé au parc Borély',
      type: 'Mobilier urbain',
      status: 'pending',
      desc: 'Banc en bois fendu en deux côté entrée nord, dangereux pour les personnes âgées.',
      location: { latitude: 43.272, longitude: 5.3819 },
      createdAt: '2026-04-02T11:15:00.000Z',
      updatedAt: '2026-04-02T11:15:00.000Z',
    },
    {
      id: '11111111-0004-0004-0004-000000000004',
      authorId,
      title: 'Dépôt sauvage avenue du Prado',
      type: 'Propreté',
      status: 'resolved',
      desc: 'Meubles abandonnés sur le trottoir côté pairs, impossible de passer en fauteuil roulant.',
      createdAt: '2026-03-28T16:45:00.000Z',
      updatedAt: '2026-04-01T10:30:00.000Z',
      resolvedAt: '2026-04-01T10:30:00.000Z',
    },
    {
      id: '11111111-0005-0005-0005-000000000005',
      authorId,
      title: 'Trottoir affaissé',
      type: 'Voirie',
      status: 'cancelled',
      desc: 'Trottoir affaissé sur 3 mètres, risque de chute pour les piétons.',
      location: { latitude: 43.2901, longitude: 5.3747 },
      createdAt: '2026-03-21T09:00:00.000Z',
      updatedAt: '2026-03-25T12:00:00.000Z',
    },
  ];
}
