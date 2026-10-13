import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ScreenRenderer } from './src/components/ScreenRenderer';
import { NavigationContext } from './src/navigation/NavigationContext';
import { useScreen } from './src/hooks/useScreen';
import { theme } from './src/theme/theme';
import { messages } from './src/i18n/messages';

const INITIAL_SCREEN = 'home';

/**
 * Entrada del historial. `key` es único por navegación: distingue dos visitas
 * a la misma pantalla (ej. 'home' mostrando el login y luego 'home' ya con
 * sesión) para que se vuelva a pedir al backend y se monte desde cero.
 */
interface StackEntry {
  screenId: string;
  key: number;
}

export default function App() {
  const nextKey = useRef(1);

  // Stack de navegación: la última entrada es la pantalla visible.
  const [stack, setStack] = useState<StackEntry[]>([{ screenId: INITIAL_SCREEN, key: 0 }]);
  const current = stack[stack.length - 1];
  const screen = useScreen(current.screenId, current.key);

  const navigate = useCallback((screenId: string) => {
    const entry = { screenId, key: nextKey.current++ };
    setStack((prev) => [...prev, entry]);
  }, []);

  // Login / logout: se descarta el historial para que "atrás" no regrese
  // a una pantalla de la sesión anterior.
  const resetTo = useCallback((screenId: string) => {
    setStack([{ screenId, key: nextKey.current++ }]);
  }, []);

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
          <StatusBar style="auto" />
            <ScrollView contentContainerStyle={styles.content}>
            {screen ? <ScreenRenderer key={current.key} screen={screen} /> : <Text>{messages.common.loading}</Text>}
          </ScrollView>
        </SafeAreaView>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
});