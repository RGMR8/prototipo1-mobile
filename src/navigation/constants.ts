/**
 * Pantallas que la app necesita conocer por nombre.
 * - INITIAL: la primera que se pide; el backend decide si hace falta login.
 * - LOGIN: destino cuando la sesión expira (401) o el logout falla sin red.
 *   Es el único lugar donde la app nombra una pantalla por su cuenta.
 */
export const INITIAL_SCREEN_ID = 'home';
export const LOGIN_SCREEN_ID = 'login';