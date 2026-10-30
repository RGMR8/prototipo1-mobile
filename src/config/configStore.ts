/**
 * Configuración vigente en memoria (#6). Módulo sin dependencias a propósito:
 * lo leen client.ts y precacheScreens.ts, y lo llena appConfig.ts. Así
 * appConfig puede usar client.ts sin crear un ciclo de imports.
 */
export interface AppConfig {
  /** Primera pantalla que se pide al abrir la app. */
  initialScreenId: string;
  /** Tiempo máximo de espera por petición, en milisegundos. */
  requestTimeoutMs: number;
  /** Si después del login se descargan las pantallas para usarlas sin conexión. */
  offlinePrecache: boolean;
}

export const DEFAULT_APP_CONFIG: Readonly<AppConfig> = Object.freeze({
  initialScreenId: 'home',
  requestTimeoutMs: 15000,
  offlinePrecache: true,
});

let current: AppConfig = { ...DEFAULT_APP_CONFIG };

/** Configuración vigente. Síncrona: initAppConfig ya la dejó lista al arrancar. */
export function getAppConfig(): Readonly<AppConfig> {
  return current;
}

/** Solo la llama appConfig.ts al cargar o refrescar la configuración. */
export function setAppConfig(config: AppConfig): void {
  current = config;
}

let pendingRefresh: Promise<void> | null = null;

/** appConfig.ts registra aquí el refresco en curso (o null al terminar). */
export function setPendingRefresh(promise: Promise<void> | null): void {
  pendingRefresh = promise;
}

/**
 * Espera a que termine el refresco de configuración en curso, si hay uno.
 * Quien decide algo con la configuración justo después del arranque o del
 * login (ej. la precarga) la espera para no usar un valor viejo.
 */
export async function waitForConfigRefresh(): Promise<void> {
  if (pendingRefresh !== null) await pendingRefresh;
}
