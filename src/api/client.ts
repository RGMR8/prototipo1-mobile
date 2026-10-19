/**
 * API client — único archivo que conoce la URL del backend.
 *
 * Prototipo #3: si hay sesión, toda petición lleva `Authorization: Bearer <token>`.
 * Prototipo #4: toda falla sale como ApiError (red, timeout, código HTTP o
 * respuesta inválida). Nunca se devuelve un cuerpo de error como si fuera éxito.
 */
import { getToken } from '../session/tokenStorage';
import { ApiError } from './apiError';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('Falta EXPO_PUBLIC_API_BASE_URL en el .env');
}

/** Tiempo máximo de espera por petición. Con mala señal, mejor un error claro que una espera infinita. */
const REQUEST_TIMEOUT_MS = 15000;

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

/** Lee el cuerpo como JSON. undefined si viene vacío o no es JSON (ej. HTML de un 404 de Apache). */
async function readJson(response: Response): Promise<unknown | undefined> {
  const text = await response.text();
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Extrae `mensaje` del cuerpo de error del router PHP, si viene. */
function serverMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const mensaje = (body as Record<string, unknown>).mensaje;
  if (typeof mensaje !== 'string') return undefined;
  return mensaje;
}

/**
 * Única función que hace fetch. Convierte cualquier falla en ApiError:
 * timeout (AbortController), sin red, código HTTP de error o cuerpo inválido.
 */
async function request(url: string, init: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = await readJson(response);

    if (!response.ok) {
      throw new ApiError('http', response.status, serverMessage(body));
    }
    if (body === undefined) {
      throw new ApiError('invalid_response', response.status);
    }
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError('timeout');
    throw new ApiError('network');
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchScreen(screenId: string): Promise<unknown> {
  return request(
    `${API_BASE_URL}/api/base_movil/index.php?method=obten_pantalla&screenId=${encodeURIComponent(screenId)}`,
    { headers: await buildHeaders() }
  );
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
  return request(
    `${API_BASE_URL}/api/base_movil/index.php?method=${encodeURIComponent(method)}`,
    {
      method: 'POST',
      headers: await buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }
  );
}