import type { ReportStatus, ReportType } from '@repo/contracts/report';

// Mapping to seeded user numeric IDs (from user.seed.ts seedId):
// 1=citizen1, 2=citizen2, 3=citizen3

export type ReportSeedTemplate = {
  id: string;
  authorSeedId: number;
  title: string;
  type: ReportType;
  status: ReportStatus;
  desc: string;
  photoUrl: string;
  location?: { latitude: number; longitude: number };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

export const REPORT_SEED_TEMPLATES: ReportSeedTemplate[] = [
  {
    id: '11111111-0001-0001-0001-000000000001',
    authorSeedId: 1,
    title: 'Lampadaire défectueux',
    type: 'Éclairage public',
    status: 'progress',
    desc: 'Le lampadaire au coin de la rue Pasteur clignote depuis plusieurs nuits et éclaire mal le trottoir.',
    photoUrl: 'https://picsum.photos/seed/report-1/800/600',
    location: { latitude: 43.2965, longitude: 5.3698 },
    createdAt: '2026-04-12T10:00:00.000Z',
    updatedAt: '2026-04-14T09:00:00.000Z',
  },
  {
    id: '11111111-0002-0002-0002-000000000002',
    authorSeedId: 2,
    title: 'Tag sur abribus',
    type: 'Propreté',
    status: 'resolved',
    desc: "Des tags ont été apposés sur la vitre et le cadre de l'abribus de la place centrale.",
    photoUrl: 'https://picsum.photos/seed/report-2/800/600',
    location: { latitude: 43.2967, longitude: 5.3712 },
    createdAt: '2026-04-08T08:30:00.000Z',
    updatedAt: '2026-04-11T14:00:00.000Z',
    resolvedAt: '2026-04-11T14:00:00.000Z',
  },
  {
    id: '11111111-0003-0003-0003-000000000003',
    authorSeedId: 1,
    title: 'Banc cassé au parc Borély',
    type: 'Mobilier urbain',
    status: 'pending',
    desc: 'Banc en bois fendu en deux côté entrée nord, dangereux pour les personnes âgées.',
    photoUrl: 'https://picsum.photos/seed/report-3/800/600',
    location: { latitude: 43.272, longitude: 5.3819 },
    createdAt: '2026-04-02T11:15:00.000Z',
    updatedAt: '2026-04-02T11:15:00.000Z',
  },
  {
    id: '11111111-0004-0004-0004-000000000004',
    authorSeedId: 3,
    title: 'Dépôt sauvage avenue du Prado',
    type: 'Propreté',
    status: 'resolved',
    desc: 'Meubles abandonnés sur le trottoir côté pairs, impossible de passer en fauteuil roulant.',
    photoUrl: 'https://picsum.photos/seed/report-4/800/600',
    createdAt: '2026-03-28T16:45:00.000Z',
    updatedAt: '2026-04-01T10:30:00.000Z',
    resolvedAt: '2026-04-01T10:30:00.000Z',
  },
  {
    id: '11111111-0005-0005-0005-000000000005',
    authorSeedId: 2,
    title: 'Trottoir affaissé',
    type: 'Voirie',
    status: 'cancelled',
    desc: 'Trottoir affaissé sur 3 mètres, risque de chute pour les piétons.',
    photoUrl: 'https://picsum.photos/seed/report-5/800/600',
    location: { latitude: 43.2901, longitude: 5.3747 },
    createdAt: '2026-03-21T09:00:00.000Z',
    updatedAt: '2026-03-25T12:00:00.000Z',
  },
];
