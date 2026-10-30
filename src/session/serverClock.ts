import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Última hora conocida del servidor (#6).
 *
 * Sin conexión, la vigencia de la sesión se decide con el reloj del
 * teléfono. Para que atrasar el reloj no extienda la sesión, se guarda la
 * hora más reciente que informó el servidor (cabecera Date de cada
 * respuesta). Si el teléfono marca una hora anterior, el reloj fue atrasado.
 *
 * Solo avanza: nunca se guarda una hora menor a la que ya había.
 */
const STORAGE_KEY = 'base_movil_last_server_time';

/** Para no escribir en cada petición: solo si avanzó al menos un minuto. */
const MIN_STEP_MS = 60 * 1000;

let lastKnown: number | null = null;

export async function getLastServerTime(): Promise<number> {
  if (lastKnown !== null) return lastKnown;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const value = stored === null ? 0 : Number(stored);
    lastKnown = Number.isFinite(value) ? value : 0;
  } catch {
    lastKnown = 0;
  }
  return lastKnown;
}

/**
 * Registra la hora de una respuesta del servidor. No espera ni lanza.
 * En la web el navegador no deja leer la cabecera Date (CORS): ahí se usa
 * solo la hora del token (iat).
 */
export function recordServerTime(dateHeader: string | null): void {
  if (dateHeader === null) return;
  const time = Date.parse(dateHeader);
  if (Number.isNaN(time)) return;
  void store(time);
}

async function store(time: number): Promise<void> {
  const previous = await getLastServerTime();
  if (time < previous + MIN_STEP_MS) return;
  lastKnown = time;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(time));
  } catch {
    // Se queda solo en memoria: vale para esta ejecución.
  }
}
