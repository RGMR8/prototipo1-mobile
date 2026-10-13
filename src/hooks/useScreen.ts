import { useEffect, useState } from 'react';
import { fetchScreen } from '../api/client';
import { parseScreen, ScreenParseError } from '../parser/parseScreen';
import type { ScreenDefinition } from '../types/screen';

/**
 * Carga y parsea una pantalla del backend. Sin caché (excluido del #2):
 * volver a una pantalla la pide de nuevo.
 */
/**
 * `key` identifica cada entrada del historial: si se navega de nuevo a la
 * misma pantalla (ej. reset a 'home' después del login), cambia la key y la
 * pantalla se vuelve a pedir aunque el screenId sea el mismo.
 */
export function useScreen(screenId: string, key: number): ScreenDefinition | null {
  const [screen, setScreen] = useState<ScreenDefinition | null>(null);

  useEffect(() => {
    // Si se navega antes de que llegue la respuesta anterior, se descarta.
    let cancelled = false;
    setScreen(null);

    fetchScreen(screenId).then((raw) => {
      if (cancelled) return;
      try {
        setScreen(parseScreen(raw));
      } catch (error) {
        if (error instanceof ScreenParseError) {
          // Sin UI de error todavía (Prototipo #4).
          console.error('Error al parsear la pantalla:', error.message);
        }
        throw error;
      }
    });

    return () => {
      cancelled = true;
    };
  },[screenId, key]);

  return screen;
}