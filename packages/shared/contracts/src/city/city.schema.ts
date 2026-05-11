import { z } from 'zod';

export const CityId = z
  .string()
  .length(9)
  .regex(/^[A-Z]{3}_[0-9]{5}$/);
export type CityId = z.infer<typeof CityId>;

export const CityPublicDto = z.object({
  id: CityId,
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
});
export type CityPublicDto = z.infer<typeof CityPublicDto>;

export const UpdateCityInput = z.object({
  description: z.string().min(1).max(2000),
});
export type UpdateCityInput = z.infer<typeof UpdateCityInput>;

