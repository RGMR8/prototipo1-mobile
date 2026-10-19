import { clearToken } from './tokenStorage';
import { clearScreenCache } from '../cache/screenCache';

/**
 * Cierra la sesión en el dispositivo: token y pantallas cacheadas.
 * Se usa en logout y en 401, para que el siguiente usuario del
 * teléfono no vea pantallas de la sesión anterior.
 */
export async function endSession(): Promise<void> {
  await clearToken();
  await clearScreenCache();
}