import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Caché local de pantallas (#4).
 *
 * Guarda el JSON crudo del backend, no el parseado: al leerlo vuelve a
 * pasar por el parser, así que un caché viejo nunca se usa sin validar.
 *
 * Nunca rompe la app: cualquier fallo de almacenamiento se trata como
 * "no hay caché" y la pantalla se pide al servidor.
 */
const KEY_PREFIX = 'base_movil_screen:';

interface CacheEntry {
  savedAt: number; // ms (Date.now())
  ttl: number;     // segundos
  raw: unknown;
}

function keyOf(screenId: string): string {
  return `${KEY_PREFIX}${screenId}`;
}

function isCacheEntry(value: unknown): value is CacheEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.savedAt === 'number' && typeof entry.ttl === 'number' && 'raw' in entry;
}

/** Devuelve el JSON crudo si existe y no venció; si venció lo borra. null si no hay. */
export async function getFreshScreen(screenId: string): Promise<unknown | null> {
  try {
    const stored = await AsyncStorage.getItem(keyOf(screenId));
    if (stored === null) return null;

    const entry: unknown = JSON.parse(stored);
    if (!isCacheEntry(entry)) {
      await removeScreen(screenId);
      return null;
    }

    const expired = Date.now() - entry.savedAt >= entry.ttl * 1000;
    if (expired) {
      await removeScreen(screenId);
      return null;
    }
    return entry.raw;
  } catch {
    return null;
  }
}

/** Guarda la pantalla si su TTL lo permite (ttl > 0). */
export async function saveScreen(screenId: string, raw: unknown, ttl: number): Promise<void> {
  if (ttl <= 0) return;
  try {
    const entry: CacheEntry = { savedAt: Date.now(), ttl, raw };
    await AsyncStorage.setItem(keyOf(screenId), JSON.stringify(entry));
  } catch {
    // Sin caché la app sigue funcionando: solo pide al servidor la próxima vez.
  }
}

export async function removeScreen(screenId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyOf(screenId));
  } catch {
    // Ignorado: una entrada que no se pudo borrar vence sola por TTL.
  }
}

/** Borra todas las pantallas cacheadas (fin de sesión). */
export async function clearScreenCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const screenKeys = keys.filter((key) => key.startsWith(KEY_PREFIX));
    if (screenKeys.length === 0) return;
    await AsyncStorage.multiRemove(screenKeys);
  } catch {
    // Ignorado: lo que quede vence por TTL.
  }
}