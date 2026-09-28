import { createContext, useContext } from 'react';

export interface FormContextValue {
  values: Record<string, string>;
  errors: Record<string, string>;
  setValue: (name: string, value: string) => void;
  /** Valida todo el form, pinta los errores y devuelve si es válido. */
  validate: () => boolean;
}

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