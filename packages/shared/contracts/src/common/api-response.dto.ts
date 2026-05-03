/** Réponse d’erreur JSON standard renvoyée par les contrôleurs. */
export type ApiErrorDto = {
  error: string;
};

/** Erreur de validation avec détails (ex. Zod `flatten()`). */
export type ApiErrorWithDetailsDto = {
  error: string;
  details: unknown;
};

export type OperationSuccessDto = {
  success: true;
};
