import { z } from 'zod';

export const ReportStatus = z.enum(['pending', 'progress', 'resolved', 'cancelled']);
export type ReportStatus = z.infer<typeof ReportStatus>;

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
export const ReportType = z.enum(REPORT_TYPES);
export type ReportType = z.infer<typeof ReportType>;

export const GpsLocation = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type GpsLocation = z.infer<typeof GpsLocation>;

export const Report = z.object({
  id: z.string().uuid(),
  authorId: z.string(),
  cityId: z.string(),
  title: z.string().min(1).max(120),
  type: ReportType,
  status: ReportStatus,
  desc: z.string().min(6),
  photoUrl: z.string().url(),
  location: GpsLocation.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});
export type Report = z.infer<typeof Report>;

export const CreateReportFormFields = z.object({
  desc: z.string().min(6),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  // Note: 'photo' is sent as multipart File and validated separately in the controller
});
export type CreateReportFormFields = z.infer<typeof CreateReportFormFields>;

export const CreateReportPayload = z.object({
  desc: z.string().min(6),
  photo: z.instanceof(File),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});
export type CreateReportPayload = z.infer<typeof CreateReportPayload>;

export const ReportsListQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
export type ReportsListQuery = z.infer<typeof ReportsListQuery>;

export const PaginatedReportsResponse = z.object({
  data: z.array(Report),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginatedReportsResponse = z.infer<typeof PaginatedReportsResponse>;
