import { z } from 'zod';

export const MediaImageLinkType = z.enum(['carousel', 'articles', 'establishments']);
export type MediaImageLinkType = z.infer<typeof MediaImageLinkType>;

export const MediaImageLink = z.object({
  idLink: z.string().uuid(),
  type: MediaImageLinkType,
  title: z.string(),
});
export type MediaImageLink = z.infer<typeof MediaImageLink>;

export const MediaImage = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  url: z.string().url(),
  storagePath: z.string(),
  cityId: z.string().uuid(),
  createdAt: z.string().datetime(),
  links: z.array(MediaImageLink),
});
export type MediaImage = z.infer<typeof MediaImage>;
