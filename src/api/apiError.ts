/**
 * Error de comunicacion con el backend, ya clasificado.
 * El cliente lo lanzo; la UI decide qué mostrar (errorMessage.ts).
 *
 * - network:          no hubo conexión con el servidor.
 * - timeout:          el servidor no respondió a tiempo.
 * - http:             respondió con un código de error (status).
 * - invalid_response: respondió 2xx pero el cuerpo no es JSON.
 */
export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'invalid_response';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
    public readonly serverMessage?: string
  ) {
    super(status === undefined ? `ApiError ${kind}` : `ApiError ${kind} ${status}`);
    this.name = 'ApiError';
  }

  /** Sesión inválida o expirada: el cliente debe borrar el token e ir a login. */
  get isUnauthorized(): boolean {
    return this.kind === 'http' && this.status === 401;
  }
}