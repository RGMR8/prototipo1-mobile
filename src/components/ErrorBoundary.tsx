import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Lo que se muestra si algún componente hijo falla al dibujarse. */
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Atrapa errores lanzados mientras React DIBUJA los componentes hijos.
 * Un try/catch alrededor del JSX no sirve para esto: el JSX solo describe
 * los elementos y React los ejecuta después, fuera de ese try.
 *
 * Tiene que ser una clase: React no ofrece Error Boundaries con hooks.
 *
 * No atrapa errores de eventos ni de código asíncrono (fetch, onPress):
 * esos ya los manejan useScreen y handleActionError.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error al dibujar la pantalla:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}