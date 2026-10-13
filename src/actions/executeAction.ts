import type { ScreenAction, SubmitResponse } from '../types/screen';
import type { FormContextValue } from '../components/form/FormContext';
import { callMethod, submitForm } from '../api/client';
import { parseSubmitResponse } from '../parser/parseScreen';
import { getRegisteredFunction } from './functionRegistry';
import { clearToken, saveToken } from '../session/tokenStorage';

export interface ActionDeps {
  navigate: (screenId: string) => void;
  resetTo: (screenId: string) => void;
  /** null si el botón no está dentro de un Form. */
  form: FormContextValue | null;
}

export async function executeAction(action: ScreenAction, deps: ActionDeps): Promise<void> {
  if (action.type === 'NAVIGATE') {
    if (action.reset === true) {
      deps.resetTo(action.screenId);
      return;
    }
    deps.navigate(action.screenId);
    return;
  }

  if (action.type === 'SUBMIT') {
    if (deps.form === null) {
      // El parser ya lo impide; si llega aquí es un bug.
      throw new Error('SUBMIT ejecutado fuera de un Form');
    }
    // Si hay campos inválidos se pintan los errores y no se envía nada.
    if (!deps.form.validate()) return;

    const raw = await submitForm(action.method, deps.form.values);
    await applyResponse(parseSubmitResponse(raw), deps);
    return;
  }

  if (action.type === 'CALL') {
    const fn = getRegisteredFunction(action.function);
    await fn();
    return;
  }

  if (action.type === 'LOGOUT') {
    const raw = await callMethod('logout');
    // El token se borra del dispositivo pase lo que pase con la respuesta:
    // el cierre de sesión local nunca depende del servidor.
    await clearToken();
    await applyResponse(parseSubmitResponse(raw), deps);
    return;
  }

  throw new Error(`Acción no soportada: ${(action as ScreenAction).type}`);
}

/**
 * Aplica la respuesta del servidor en orden:
 * 1. session → guarda el token (login).
 * 2. errors  → los pinta en el Form y se detiene (no navega).
 * 3. action  → la ejecuta (el parser solo permite NAVIGATE, CALL o LOGOUT).
 */
async function applyResponse(response: SubmitResponse, deps: ActionDeps): Promise<void> {
  if (response.session !== undefined) {
    await saveToken(response.session.token);
  }

  if (response.errors !== undefined) {
    if (deps.form === null) {
      throw new Error('El servidor devolvió errores de campo sin un Form');
    }
    deps.form.setServerErrors(response.errors);
    return;
  }

  if (response.action !== undefined) {
    await executeAction(response.action, deps);
  }
}