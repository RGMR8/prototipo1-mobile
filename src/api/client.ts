/**
 * API client — Prototipo #1 y 2
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export async function fetchScreen(screenId: string): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/api/base_movil/index.php?method=obten_pantalla&screenId=${encodeURIComponent(screenId)}`
  );
  return response.json();
}

/**
 * Envía los valores de un Form al método indicado por la acción SUBMIT.
 * El body va como JSON: en PHP se lee con php://input, no con $_POST.
 */
export async function submitForm(method: string, values: Record<string, string>): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/api/base_movil/index.php?method=${encodeURIComponent(method)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ values }),
    }
  );
  return response.json();
}