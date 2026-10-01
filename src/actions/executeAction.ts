import type { ScreenAction } from '../types/screen';
import type { FormContextValue } from '../components/form/FormContext';
import { submitForm } from '../api/client';
import { parseSubmitResponse } from '../parser/parseScreen';
import { getRegisteredFunction } from './functionRegistry';

export interface ActionDeps {
  navigate: (screenId: string) => void;
  /** null si el botón no está dentro de un Form. */
  form: FormContextValue | null;
}

export async function executeAction(action: ScreenAction, deps: ActionDeps): Promise<void> {
  if (action.type === 'NAVIGATE') {
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
    const response = parseSubmitResponse(raw);
    // El servidor decide qué sigue (el parser solo permite NAVIGATE).
    await executeAction(response.action, deps);
    return;
  }

  if (action.type === 'CALL') {
    const fn = getRegisteredFunction(action.function);
    await fn();
    return;
  }

  throw new Error(`Acción no soportada: ${(action as ScreenAction).type}`);
}