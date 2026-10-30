import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAppConfig } from '../api/client';
import { DEFAULT_APP_CONFIG, setAppConfig, setPendingRefresh, type AppConfig } from './configStore';

export { getAppConfig, type AppConfig } from './configStore';

/**
 * Configuración general de la app definida por el backend (#6).
 *
 * El backend decide cómo se comporta la app; aquí solo están los valores
 * por defecto para cuando todavía no hay configuración (primer arranque sin
 * red). Ningún otro archivo lee la configuración del backend directamente:
 * todos usan getAppConfig() (vive en configStore.ts para evitar un ciclo
 * de imports con client.ts).
 *
 * Arranque (initAppConfig):
 * - Hay configuración guardada → se usa de inmediato. Si venció su ttl, se
 *   pide la nueva en segundo plano (aplica desde ese momento; la pantalla
 *   inicial, desde el siguiente arranque).
 * - No hay guardada → se pide al backend; si falla, valores por defecto.
 * La app nunca se queda bloqueada esperando la configuración.
 *
 * También se refresca en cada login (que siempre tiene red): así un cambio
 * en el backend aplica al iniciar sesión sin tener que cerrar la app.
 *
 * Mismo criterio que los estilos: una clave desconocida se ignora y un valor
 * inválido usa su valor por defecto (sin tumbar la app).
 */
/** Límites del timeout que se aceptan del backend (segundos). */
const MIN_TIMEOUT_S = 5;
const MAX_TIMEOUT_S = 120;

const STORAGE_KEY = 'base_movil_config';

interface StoredConfig {
  savedAt: number; // ms
  ttl: number; // segundos
  raw: unknown;
}

/** Se llama una vez antes de mostrar la primera pantalla. Nunca lanza. */
export async function initAppConfig(): Promise<void> {
  const stored = await readStored();

  if (stored !== null) {
    setAppConfig(parseAppConfig(stored.raw).config);
    const fresh = Date.now() - stored.savedAt < stored.ttl * 1000;
    if (!fresh) void refreshAppConfig();
    return;
  }

  await refreshAppConfig();
}

/**
 * Pide la configuración al backend, la aplica y la guarda. Nunca lanza.
 * Mientras corre queda registrada en configStore para que la precarga la
 * espere (waitForConfigRefresh).
 */
export function refreshAppConfig(): Promise<void> {
  const promise = doRefresh().finally(() => setPendingRefresh(null));
  setPendingRefresh(promise);
  return promise;
}

async function doRefresh(): Promise<void> {
  try {
    const raw = await fetchAppConfig();
    const { config, ttl } = parseAppConfig(raw);
    setAppConfig(config);
    await writeStored({ savedAt: Date.now(), ttl, raw });
  } catch {
    // Sin red o respuesta inválida: se queda la configuración que ya había.
  }
}

/**
 * Convierte la respuesta del backend en AppConfig.
 * Forma esperada: { version, ttl, parameters: { ... } }
 */
export function parseAppConfig(raw: unknown): { config: AppConfig; ttl: number } {
  const config: AppConfig = { ...DEFAULT_APP_CONFIG };
  if (!isPlainObject(raw)) return { config, ttl: 0 };

  const ttl = typeof raw.ttl === 'number' && raw.ttl >= 0 ? raw.ttl : 0;
  const params = raw.parameters;
  if (!isPlainObject(params)) return { config, ttl };

  const initial = params.initialScreenId;
  if (typeof initial === 'string' && initial.trim() !== '') {
    config.initialScreenId = initial.trim();
  } else if (initial !== undefined) {
    warnInvalid('initialScreenId', initial);
  }

  const timeout = params.requestTimeoutSeconds;
  if (typeof timeout === 'number' && timeout >= MIN_TIMEOUT_S && timeout <= MAX_TIMEOUT_S) {
    config.requestTimeoutMs = timeout * 1000;
  } else if (timeout !== undefined) {
    warnInvalid('requestTimeoutSeconds', timeout);
  }

  const precache = params.offlinePrecache;
  if (typeof precache === 'boolean') {
    config.offlinePrecache = precache;
  } else if (precache !== undefined) {
    warnInvalid('offlinePrecache', precache);
  }

  return { config, ttl };
}

function warnInvalid(key: string, value: unknown): void {
  if (__DEV__) {
    console.warn(`Configuración: valor inválido en "${key}" (${JSON.stringify(value)}), se usa el valor por defecto.`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readStored(): Promise<StoredConfig | null> {
  try {
    const text = await AsyncStorage.getItem(STORAGE_KEY);
    if (text === null) return null;
    const entry: unknown = JSON.parse(text);
    if (!isPlainObject(entry)) return null;
    if (typeof entry.savedAt !== 'number' || typeof entry.ttl !== 'number' || !('raw' in entry)) return null;
    return { savedAt: entry.savedAt, ttl: entry.ttl, raw: entry.raw };
  } catch {
    return null;
  }
}

async function writeStored(entry: StoredConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Sin guardar, la próxima vez se vuelve a pedir: la app sigue funcionando.
  }
}