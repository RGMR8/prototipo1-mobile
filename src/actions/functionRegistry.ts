import { projectFunctions } from '../project/functions';
import type { AppFunction } from './appFunction';

export type { AppFunction } from './appFunction';

/**
 * Registro de funciones que el backend puede ejecutar con una acción CALL.
 *
 * El backend NUNCA manda código: solo el nombre de la función. La app
 * busca ese nombre aquí (lista blanca, igual que las rutas del router PHP).
 * Si no está registrado, se lanza un error explícito.
 *
 * #6: dos orígenes.
 * - coreFunctions: de la base, sirven a cualquier proyecto (futuras:
 *   guarda_local, sincroniza_servidor).
 * - projectFunctions (src/project/functions.ts): propias del cliente.
 * Un nombre repetido entre los dos hace fallar la app al arrancar: así
 * nunca se pisa una función de la base sin darse cuenta.
 */

const coreFunctions: Record<string, AppFunction> = {};

const functionRegistry: Record<string, AppFunction> = mergeRegistries(coreFunctions, projectFunctions);

function mergeRegistries(
  core: Record<string, AppFunction>,
  project: Record<string, AppFunction>
): Record<string, AppFunction> {
  for (const name of Object.keys(project)) {
    if (Object.prototype.hasOwnProperty.call(core, name)) {
      throw new Error(`La función "${name}" ya existe en la base: usa otro nombre en src/project/functions.ts`);
    }
  }
  return { ...core, ...project };
}

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
