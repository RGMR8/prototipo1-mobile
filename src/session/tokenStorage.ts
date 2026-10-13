import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Almacenamiento del token de sesión (JWT).
 *
 * - Móvil: expo-secure-store → Android Keystore / iOS Keychain (cifrado).
 * - Web: localStorage. NO es seguro (lo puede leer cualquier script de la
 *   página); se acepta solo porque la web es una preview. Anotado en
 *   DEUDA_TECNICA.md.
 *
 * El resto de la app solo usa estas tres funciones y no sabe dónde vive
 * el token: si mañana cambia el mecanismo, solo cambia este archivo.
 */
const TOKEN_KEY = 'base_movil_token';

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}