import { clearToken } from './tokenStorage';
import { clearScreenCache } from '../cache/screenCache';
import { LOGIN_SCREEN_ID } from '../navigation/constants';

/**
 * Cierra la sesión en el dispositivo: token y pantallas cacheadas.
 * Se conserva login: es pública y así el logout sin señal termina en el
 * formulario de login y no en una pantalla de error.
 */
export async function endSession(): Promise<void> {
  await clearToken();
  await clearScreenCache([LOGIN_SCREEN_ID]);
}