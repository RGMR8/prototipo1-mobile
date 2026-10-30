/**
 * Pantallas que la app necesita conocer por nombre.
 * - LOGIN: destino cuando la sesión expira (401) o el logout falla sin red.
 *   Es el único lugar donde la app nombra una pantalla por su cuenta.
 *
 * La pantalla inicial ya no está aquí: la define el backend
 * (config/appConfig.ts, `initialScreenId`).
 */
export const LOGIN_SCREEN_ID = 'login';
