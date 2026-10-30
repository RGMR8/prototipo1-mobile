import { getToken } from './tokenStorage';
import { getLastServerTime } from './serverClock';

/**
 * Vigencia de la sesión leída del propio token (#5, modo sin conexión).
 *
 * El token es un JWT: su parte central (payload) trae `exp` (vencimiento)
 * e `iat` (emisión), en segundos. La app NO valida la firma (eso solo lo
 * puede hacer el servidor, que tiene la clave); solo lee las fechas para no
 * seguir mostrando pantallas guardadas sin conexión cuando la sesión venció.
 *
 * #6: reloj atrasado. Si el teléfono marca una hora anterior a la última
 * hora conocida del servidor (respuestas o `iat` del token), el reloj fue
 * atrasado y la sesión se trata como vencida. Se da un margen para
 * diferencias normales de reloj.
 *
 * Con conexión, el servidor siempre tiene la última palabra (responde 401).
 */
const CLOCK_TOLERANCE_MS = 5 * 60 * 1000;

export async function hasValidSession(): Promise<boolean> {
  const token = await getToken();
  if (token === null) return false;

  const claims = tokenClaims(token);
  const now = Date.now();

  const issuedAt = claims?.iat ?? 0;
  const lastServerTime = Math.max(await getLastServerTime(), issuedAt);
  if (now < lastServerTime - CLOCK_TOLERANCE_MS) return false;

  // Si no se puede leer la fecha, decide el servidor cuando haya conexión.
  if (claims?.exp === undefined) return true;
  return now < claims.exp;
}

/** Fecha de vencimiento del token en milisegundos, o null si no se puede leer. */
export function tokenExpiresAt(token: string): number | null {
  return tokenClaims(token)?.exp ?? null;
}

interface TokenTimes {
  /** Vencimiento en ms. */
  exp?: number;
  /** Emisión en ms. */
  iat?: number;
}

/** Fechas del payload del JWT en milisegundos, o null si el token no se puede leer. */
function tokenClaims(token: string): TokenTimes | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    if (typeof payload !== 'object' || payload === null) return null;
    const { exp, iat } = payload as Record<string, unknown>;
    return {
      exp: typeof exp === 'number' ? exp * 1000 : undefined,
      iat: typeof iat === 'number' ? iat * 1000 : undefined,
    };
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
