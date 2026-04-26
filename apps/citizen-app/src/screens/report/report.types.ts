export type ReportStatus = 'pending' | 'progress' | 'resolved' | 'cancelled';

export interface Report {
  id: string;
  date: string;
  title: string;
  type: string;
  status: ReportStatus;
  desc: string;
}

export const REPORT_TYPES = [
  'Voirie',
  'Éclairage public',
  'Propreté',
  'Mobilier urbain',
  'Espaces verts',
  'Stationnement',
  'Sécurité',
  'Bruit',
  'Autre',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const SEED_REPORTS: Report[] = [
  {
    id: 'r-1042',
    date: '12/04/26',
    title: 'Lampadaire défectueux',
    type: 'Éclairage public',
    status: 'progress',
    desc: 'Le lampadaire au coin de la rue Pasteur clignote depuis plusieurs nuits et éclaire mal le trottoir.',
  },
  {
    id: 'r-1041',
    date: '08/04/26',
    title: 'Tag sur abribus',
    type: 'Propreté',
    status: 'resolved',
    desc: "Des tags ont été apposés sur la vitre et le cadre de l'abribus de la place centrale.",
  },
  {
    id: 'r-1038',
    date: '02/04/26',
    title: 'Banc cassé au parc Borély',
    type: 'Mobilier urbain',
    status: 'pending',
    desc: 'Banc en bois fendu en deux côté entrée nord, dangereux pour les personnes âgées.',
  },
  {
    id: 'r-1031',
    date: '28/03/26',
    title: 'Dépôt sauvage avenue du Prado',
    type: 'Propreté',
    status: 'resolved',
    desc: 'Meubles abandonnés sur le trottoir côté pairs, impossible de passer en fauteuil roulant.',
  },
  {
    id: 'r-1027',
    date: '21/03/26',
    title: 'Trottoir affaissé',
    type: 'Voirie',
    status: 'cancelled',
    desc: 'Trottoir affaissé sur 3 mètres, risque de chute pour les piétons.',
  },
];
