import { createContext, useContext } from 'react';

export interface NavigationContextValue {
  navigate: (screenId: string) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (ctx === null) {
    throw new Error('useNavigation debe usarse dentro de NavigationContext.Provider');
  }
  return ctx;
}