import { getToken } from './tokenStorage';

/**
 * Vigencia de la sesión leída del propio token (#5, modo sin conexión).
 *
 * El token es un JWT: su parte central (payload) trae `exp`, la fecha de
 * vencimiento en segundos. La app NO valida la firma (eso solo lo puede
 * hacer el servidor, que tiene la clave); solo lee la fecha para no seguir
 * mostrando pantallas guardadas sin conexión cuando la sesión ya venció.
 *
 * Límite conocido: depende del reloj del teléfono. Con conexión, el
 * servidor siempre tiene la última palabra (responde 401).
 */
export async function hasValidSession(): Promise<boolean> {
  const token = await getToken();
  if (token === null) return false;
  const expiresAt = tokenExpiresAt(token);
  // Si no se puede leer la fecha, decide el servidor cuando haya conexión.
  if (expiresAt === null) return true;
  return Date.now() < expiresAt;
}

/** Fecha de vencimiento del token en milisegundos, o null si no se puede leer. */
export function tokenExpiresAt(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    if (typeof payload !== 'object' || payload === null) return null;
    const exp = (payload as Record<string, unknown>).exp;
    if (typeof exp !== 'number') return null;
    return exp * 1000;
  } catch {
    return null;
  }
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodifica base64url a texto. Implementación propia para no depender de
 * `atob`, que no está igual en todas las versiones del motor de JavaScript.
 * El payload de nuestro JWT es JSON ASCII, así que basta con bytes → texto.
 */
function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let bits = 0;
  let value = 0;
  let output = '';
  for (const char of base64) {
    const index = BASE64_CHARS.indexOf(char);
    if (index === -1) throw new Error('base64 inválido');
    value = (value << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((value >> bits) & 0xff);
    }
  }
  return output;
}
