import { Alert, Platform } from 'react-native';
import { messages } from '../i18n/messages';

/**
 * Registro de funciones que el backend puede ejecutar con una acción CALL.
 *
 * El backend NUNCA manda código: solo el nombre de la función. La app
 * busca ese nombre aquí (lista blanca, igual que $metodos_habilitados
 * en el router PHP). Si no está registrado, se lanza un error explícito.
 *
 * Agregar una función = escribirla aquí y agregarla a `functionRegistry`.
 * Futuras: guarda_local (SQLite), sincroniza_servidor.
 */
export type AppFunction = () => void | Promise<void>;

/** Alert.alert no está implementado en web (react-native-web): se usa window.alert. */
function showAlert(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function funcionPrueba(): void {
  showAlert(messages.functions.testTitle, messages.functions.testMessage);
}

const functionRegistry: Record<string, AppFunction> = {
  funcion_prueba: funcionPrueba,
};

/**
 * hasOwnProperty (y no `name in registry`) para que nombres heredados
 * del prototipo de Object, como "toString", no cuenten como registrados.
 */
export function isRegisteredFunction(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(functionRegistry, name);
}

export function getRegisteredFunction(name: string): AppFunction {
  if (!isRegisteredFunction(name)) {
    throw new Error(`Función no registrada: ${name}`);
  }
  return functionRegistry[name];
}