import { fetchOfflineScreens } from '../api/client';
import { parseScreen } from '../parser/parseScreen';
import { getToken } from '../session/tokenStorage';
import { getAppConfig, waitForConfigRefresh } from '../config/configStore';
import { saveScreen } from './screenCache';

/**
 * Precarga de pantallas para el modo sin conexión.
 *
 * Pide al backend, en una sola petición, todas las pantallas que el
 * usuario puede necesitar sin señal (la lista la decide el backend) y las
 * guarda en el caché de siempre, cada una con su ttl. Así, si el usuario
 * inicia sesión y apaga los datos, puede abrir pantallas que no visitó.
 *
 * #6: el backend la puede apagar con `offlinePrecache` (proyectos que no
 * trabajan sin conexión no descargan pantallas de más).
 *
 * Es de mejor esfuerzo: nunca lanza. Si falla, la app sigue igual que antes
 * y las pantallas se piden una por una al abrirlas.
 */
export async function precacheScreens(): Promise<void> {
  // Si se está refrescando la configuración (arranque o login), se espera
  // para decidir con el valor nuevo de offlinePrecache.
  await waitForConfigRefresh();
  if (!getAppConfig().offlinePrecache) return;
  try {
    const tokenAtStart = await getToken();
    if (tokenAtStart === null) return;

    const raw = await fetchOfflineScreens();
    const screens = extractScreens(raw);

    // Si se cerró sesión (o cambió de usuario) mientras llegaba la
    // respuesta, no se guarda nada: el caché ya se limpió para esa sesión.
    if ((await getToken()) !== tokenAtStart) return;

    for (const rawScreen of screens) {
      await saveOne(rawScreen);
    }
  } catch {
    // Sin red, sesión vencida o respuesta inválida: se ignora.
  }
}

/** La respuesta es { screens: [...] }. Cualquier otra forma = nada que guardar. */
function extractScreens(raw: unknown): unknown[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const screens = (raw as Record<string, unknown>).screens;
  if (!Array.isArray(screens)) return [];
  return screens;
}

/**
 * Valida la pantalla con el parser antes de guardarla (lo mismo que hace
 * loadScreen) y la guarda con su screenId y ttl. Una pantalla inválida se
 * salta sin afectar a las demás.
 */
async function saveOne(rawScreen: unknown): Promise<void> {
  try {
    const screen = parseScreen(rawScreen);
    await saveScreen(screen.screenId, rawScreen, screen.ttl);
  } catch {
    // Se salta: al abrirla se pedirá al servidor como siempre.
  }
}
