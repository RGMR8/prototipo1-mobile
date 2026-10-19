import { fetchScreen } from '../api/client';
import { parseScreen } from '../parser/parseScreen';
import { getFreshScreen, removeScreen, saveScreen } from '../cache/screenCache';
import type { ScreenDefinition } from '../types/screen';

/**
 * Obtiene una pantalla:
 * 1. Si hay caché vigente (dentro del TTL), la usa sin ir a la red.
 * 2. Si no, la pide al servidor y la guarda según el ttl que mandó.
 *
 * Si el caché no pasa el parser (dañado o de una versión anterior), se
 * descarta y se pide de nuevo. Los errores de red/HTTP suben tal cual.
 */
export async function loadScreen(screenId: string): Promise<ScreenDefinition> {
  const cached = await getFreshScreen(screenId);
  if (cached !== null) {
    try {
      return parseScreen(cached);
    } catch {
      await removeScreen(screenId);
    }
  }

  const raw = await fetchScreen(screenId);
  const screen = parseScreen(raw);
  await saveScreen(screenId, raw, screen.ttl);
  return screen;
}