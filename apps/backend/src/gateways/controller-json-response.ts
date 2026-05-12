import type { ApiErrorDto } from '@repo/contracts';
import type { TypedResponse } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Codes d’erreur client couverts par défaut pour les réponses `ApiErrorDto`. */
export const CONTROLLER_JSON_DEFAULT_ERROR_STATUSES = [400, 401, 403, 404, 409] as const;

type ControllerJsonSuccess<T, S extends ContentfulStatusCode> = Response & TypedResponse<T, S, 'json'>;

type ControllerJsonErrors<E extends readonly ContentfulStatusCode[], ErrBody> = E[number] extends infer Code
  ? Code extends ContentfulStatusCode
    ? Response & TypedResponse<ErrBody, Code, 'json'>
    : never
  : never;

/**
 * Réponse JSON d’un handler : **succès** (`T` + code `SuccessStatus`) **ou erreurs** (`ErrBody`,
 * typiquement `ApiErrorDto`) pour chaque code listé dans `ErrorStatuses`.
 *
 * Par défaut, tous les codes d’erreur client usuels sont prévus (le handler peut n’en retourner
 * qu’une partie). Passer `readonly []` pour `ErrorStatuses` si le handler ne renvoie jamais d’erreur JSON.
 */
export type ControllerJson<
  T,
  SuccessStatus extends ContentfulStatusCode = 200,
  ErrorStatuses extends readonly ContentfulStatusCode[] = typeof CONTROLLER_JSON_DEFAULT_ERROR_STATUSES,
  ErrBody = ApiErrorDto,
> = ControllerJsonSuccess<T, SuccessStatus> | ControllerJsonErrors<ErrorStatuses, ErrBody>;
