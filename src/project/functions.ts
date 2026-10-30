import { showAlert } from '../ui/showAlert';
import type { AppFunction } from '../actions/appFunction';

/**
 * Funciones propias de ESTE proyecto que el backend puede ejecutar con una
 * acción CALL (ej. { type: 'CALL', function: 'funcion_prueba' }).
 *
 * Aquí va solo lo que es de un cliente. Lo que sirve a cualquier proyecto
 * (ej. sincronización) va en la base: src/actions/functionRegistry.ts.
 *
 * Agregar una función = escribirla aquí y agregarla a `projectFunctions`.
 * El nombre no puede repetir uno de la base: la app falla al arrancar.
 */
function funcionPrueba(): void {
  showAlert(
    'Función de prueba',
    'Esta función está escrita en React y la ejecutó el backend desde el JSON.'
  );
}

export const projectFunctions: Record<string, AppFunction> = {
  funcion_prueba: funcionPrueba,
};
