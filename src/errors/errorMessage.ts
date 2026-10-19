import { ApiError } from '../api/apiError';
import { ScreenParseError } from '../parser/parseScreen';
import { messages } from '../i18n/messages';

/**
 * Traduce cualquier error a un texto para el usuario.
 * Único lugar donde se decide qué mensaje corresponde a cada código.
 *
 * El 400 usa el mensaje del servidor porque describe el dato inválido
 * (ej. "el campo zona no es válido"); los demás códigos usan un texto
 * fijo de la app para no mostrar detalles técnicos.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ScreenParseError) return messages.errors.invalidScreen;
  if (!(error instanceof ApiError)) return messages.errors.unknown;

  if (error.kind === 'network') return messages.errors.network;
  if (error.kind === 'timeout') return messages.errors.timeout;
  if (error.kind === 'invalid_response') return messages.errors.invalidResponse;

  if (error.status === 400 && error.serverMessage !== undefined) return error.serverMessage;
  if (error.status === 401) return messages.errors.http401;
  if (error.status === 403) return messages.errors.http403;
  if (error.status === 404) return messages.errors.http404;
  if (error.status !== undefined && error.status >= 500) return messages.errors.http500;

  return messages.errors.unknown;
}