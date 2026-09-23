/**
 * API client — Prototipo #1
 *
 * Apunta al endpoint real (api/base_movil/index.php en el repo de
 * ivitec) — sin autenticación/JWT (Prototipo #3) y sin manejo de
 * errores de red (Prototipo #4).
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export async function fetchScreen(screenId: string): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/api/base_movil/index.php?method=obten_pantalla&screenId=${screenId}`
  );
  return response.json();
}