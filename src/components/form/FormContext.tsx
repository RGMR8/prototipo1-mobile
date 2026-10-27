import { createContext, useContext } from 'react';
import type { SubmitAction } from '../../types/screen';

export interface FormContextValue {
  values: Record<string, string>;
  errors: Record<string, string>;
  setValue: (name: string, value: string) => void;
  /** Valida todo el form, pinta los errores y devuelve si es válido. */
  validate: () => boolean;
  /** Pinta errores devueltos por el servidor (ej. credenciales inválidas). */
  setServerErrors: (errors: Record<string, string>) => void;
  /**
   * Envía el form: valida, llama al backend y aplica la respuesta.
   * Sin argumento usa el primer botón SUBMIT del form (lo usa el Enter de
   * un Input); el Button pasa su propia acción. Un solo camino para los dos,
   * con protección contra doble envío.
   */
  submit: (action?: SubmitAction) => Promise<void>;
  /** true mientras hay un envío en curso. */
  submitting: boolean;
}

/** Lo que una acción SUBMIT necesita del form (ver executeAction). */
export type FormSubmitTarget = Pick<FormContextValue, 'values' | 'validate' | 'setServerErrors'>;

export const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (ctx === null) {
    // El parser ya lo impide; si llega aquí es un bug, no un caso silencioso.
    throw new Error('Este componente debe renderizarse dentro de un Form');
  }
  return ctx;
}

/** Para componentes que pueden estar dentro o fuera de un Form (ej. Button). */
export function useOptionalFormContext(): FormContextValue | null {
  return useContext(FormContext);
}