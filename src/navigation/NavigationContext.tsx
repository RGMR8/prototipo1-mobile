import { createContext, useContext } from 'react';

export interface NavigationContextValue {
  /** Apila una pantalla (el botón atrás regresa a la anterior). */
  navigate: (screenId: string) => void;
  /** Reemplaza todo el historial por una pantalla (login / logout). */
  resetTo: (screenId: string) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (ctx === null) {
    throw new Error('useNavigation debe usarse dentro de NavigationContext.Provider');
  }
  return ctx;
}