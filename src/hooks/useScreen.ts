import { useCallback, useEffect, useState } from 'react';
import { fetchScreen } from '../api/client';
import { parseScreen } from '../parser/parseScreen';
import type { ScreenDefinition } from '../types/screen';

/** Estado explícito de la pantalla: nunca más un "Cargando..." sin salida. */
export type ScreenState =
  | { status: 'loading' }
  | { status: 'ready'; screen: ScreenDefinition }
  | { status: 'error'; error: unknown };

/**
 * Carga y parsea una pantalla del backend.
 *
 * `key` identifica cada entrada del historial: si se navega de nuevo a la
 * misma pantalla (ej. reset a 'home' tras el login), cambia la key y se
 * vuelve a pedir. `retry` repite la petición sin tocar el historial.
 */
export function useScreen(screenId: string, key: number): { state: ScreenState; retry: () => void } {
  const [state, setState] = useState<ScreenState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Si se navega antes de que llegue la respuesta anterior, se descarta.
    let cancelled = false;
    setState({ status: 'loading' });

    fetchScreen(screenId)
      .then((raw) => parseScreen(raw))
      .then((screen) => {
        if (cancelled) return;
        setState({ status: 'ready', screen });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error(`Error al cargar la pantalla '${screenId}':`, error);
        setState({ status: 'error', error });
      });

    return () => {
      cancelled = true;
    };
  }, [screenId, key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, retry };
}