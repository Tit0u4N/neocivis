/** Réponse d’erreur JSON standard renvoyée par les contrôleurs. */
export type ApiErrorDto = {
  error: string;
};

/** Erreur de validation avec détails (ex. Zod `flatten()`). */
export type ApiErrorWithDetailsDto = {
  error: string;
  details: unknown;
};

/** Réponse JSON minimale après une opération sans corps métier significatif (join, suppression, …). */
export type OperationSuccessDto = {
  success: boolean;
};
