import { z } from 'zod';

export const EstablishmentType = z.enum(['mairie', 'education', 'culture', 'sport']);
export type EstablishmentType = z.infer<typeof EstablishmentType>;

export const Establishment = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  type: EstablishmentType,
  address: z.string().min(1),
  hours: z.string().min(1),
  phone: z.string().min(1),
  imageUrl: z.string().url().optional(),
});
export type Establishment = z.infer<typeof Establishment>;

export const CreateEstablishmentInput = z.object({
  name: z.string().min(1).max(200),
  type: EstablishmentType,
  address: z.string().min(1),
  hours: z.string().min(1),
  phone: z.string().min(1),
  imageUrl: z.string().url().optional(),
});
export type CreateEstablishmentInput = z.infer<typeof CreateEstablishmentInput>;

export const UpdateEstablishmentInput = CreateEstablishmentInput.partial();
export type UpdateEstablishmentInput = z.infer<typeof UpdateEstablishmentInput>;
