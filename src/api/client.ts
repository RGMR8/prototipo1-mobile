/**
 * API client — único archivo que conoce la URL del backend.
 *
 * Prototipo #3: si hay sesión, toda petición lleva
 * `Authorization: Bearer <token>`. Sin manejo de errores de red
 * (Prototipo #4).
 */
import { getToken } from '../session/tokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('Falta EXPO_PUBLIC_API_BASE_URL en el .env');
}

/**
 * Cabeceras comunes de toda petición. Agrega el token si existe:
 * así ninguna llamada puede "olvidarse" de mandarlo.
 */
async function buildHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra };
  const token = await getToken();
  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchScreen(screenId: string): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/api/base_movil/index.php?method=obten_pantalla&screenId=${encodeURIComponent(screenId)}`,
    { headers: await buildHeaders() }
  );
  return response.json();
}

/**
 * Envía los valores de un Form al método indicado por la acción SUBMIT.
 * El body va como JSON: en PHP se lee con php://input, no con $_POST.
 */
export async function submitForm(method: string, values: Record<string, string>): Promise<unknown> {
  return post(method, { values });
}

/** Llama a un método del backend sin datos de formulario (ej. logout). */
export async function callMethod(method: string): Promise<unknown> {
  return post(method, {});
}

async function post(method: string, body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/api/base_movil/index.php?method=${encodeURIComponent(method)}`,
    {
      method: 'POST',
      headers: await buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }
  );
  return response.json();
}