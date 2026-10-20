import { fetchScreen } from '../api/client';
import { ApiError } from '../api/apiError';
import { parseScreen } from '../parser/parseScreen';
import { getCachedScreen, removeScreen, saveScreen } from '../cache/screenCache';
import type { ScreenDefinition } from '../types/screen';

/**
 * Obtiene una pantalla:
 * 1. Caché vigente (dentro del TTL) → se usa sin ir a la red.
 * 2. Si no, se pide al servidor y se guarda con el ttl que mandó.
 * 3. Si el servidor no es alcanzable (sin red o timeout) y hay una versión
 *    guardada aunque esté vencida, se usa: en campo es mejor la última
 *    versión conocida que una pantalla de error.
 *
 * Los errores en los que el servidor SÍ respondió (401, 404, 500) no se
 * tapan con caché: suben tal cual.
 */
export async function loadScreen(screenId: string): Promise<ScreenDefinition> {
  const cached = await getCachedScreen(screenId);

  if (cached !== null && cached.fresh) {
    const screen = tryParse(cached.raw);
    if (screen !== null) return screen;
    await removeScreen(screenId);
  }

  try {
    const raw = await fetchScreen(screenId);
    const screen = parseScreen(raw);
    await saveScreen(screenId, raw, screen.ttl);
    return screen;
  } catch (error) {
    if (cached === null || !isConnectivityError(error)) throw error;
    const stale = tryParse(cached.raw);
    if (stale === null) throw error;
    return stale;
  }
}

/** Parsea sin lanzar: un caché dañado o de otra versión se trata como inexistente. */
function tryParse(raw: unknown): ScreenDefinition | null {
  try {
    return parseScreen(raw);
  } catch {
    return null;
  }
}

/** Sin red o timeout: el servidor no respondió. */
function isConnectivityError(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === 'network' || error.kind === 'timeout');
}