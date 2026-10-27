import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, ScrollView, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ScreenRenderer } from './src/components/ScreenRenderer';
import { ErrorScreen } from './src/components/ErrorScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { NavigationContext } from './src/navigation/NavigationContext';
import { INITIAL_SCREEN_ID, LOGIN_SCREEN_ID } from './src/navigation/constants';
import { useScreen } from './src/hooks/useScreen';
import { ApiError } from './src/api/apiError';
import { endSession } from './src/session/endSession';
import { errorMessage } from './src/errors/errorMessage';
import type { AppTheme } from './src/theme/theme';
import { useTheme, useThemedStyles } from './src/theme/useTheme';
import { messages } from './src/i18n/messages';

/**
 * Entrada del historial. `key` es único por navegación: distingue dos visitas
 * a la misma pantalla para que se vuelva a pedir y se monte desde cero.
 */
interface StackEntry {
  screenId: string;
  key: number;
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.isUnauthorized;
}

export default function App() {
  const nextKey = useRef(1);
  const { scheme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  // Stack de navegación: la última entrada es la pantalla visible.
  const [stack, setStack] = useState<StackEntry[]>([{ screenId: INITIAL_SCREEN_ID, key: 0 }]);
  const current = stack[stack.length - 1];
  const { state, retry } = useScreen(current.screenId, current.key);

  const navigate = useCallback((screenId: string) => {
    const entry = { screenId, key: nextKey.current++ };
    setStack((prev) => [...prev, entry]);
  }, []);

  // Login / logout / sesión expirada: se descarta el historial para que
  // "atrás" no regrese a una pantalla de la sesión anterior.
  const resetTo = useCallback((screenId: string) => {
    setStack([{ screenId, key: nextKey.current++ }]);
  }, []);

  // 401 al pedir una pantalla: la sesión ya no sirve → borrar token e ir a login.
  useEffect(() => {
    if (state.status !== 'error') return;
    if (!isUnauthorized(state.error)) return;
    endSession().then(() => resetTo(LOGIN_SCREEN_ID));
  }, [state, resetTo]);

  // Botón "atrás" físico de Android. En web es un no-op.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length <= 1) return false; // en la primera pantalla, Android cierra la app
      setStack((prev) => prev.slice(0, -1));
      return true;
    });
    return () => subscription.remove();
  }, [stack.length]);

  const navigation = useMemo(() => ({ navigate, resetTo }), [navigate, resetTo]);

  return (
    <SafeAreaProvider>
      <NavigationContext.Provider value={navigation}>
        <SafeAreaView style={styles.safeArea}>
          {/* Iconos de la barra de estado en contraste con el fondo del tema. */}
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {renderState()}
          </ScrollView>
        </SafeAreaView>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );

  function renderState() {
    if (state.status === 'ready') {
      // La key va en el boundary: al cambiar de pantalla se monta limpio,
      // sin arrastrar el error de la anterior, y con él el ScreenRenderer.
      return (
        <ErrorBoundary
          key={current.key}
          fallback={<ErrorScreen message={messages.errors.render} onRetry={retry} />}
        >
          <ScreenRenderer screen={state.screen} />
        </ErrorBoundary>
      );
    }
    // Un 401 se resuelve solo (va a login): mientras, se muestra "Cargando".
    if (state.status === 'error' && !isUnauthorized(state.error)) {
      return <ErrorScreen message={errorMessage(state.error)} onRetry={retry} />;
    }
    return <Text style={styles.loading}>{messages.common.loading}</Text>;
  }
}

const makeStyles = (t: AppTheme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    padding: t.spacing.lg,
  },
  loading: {
    color: t.colors.textSecondary,
  },
});