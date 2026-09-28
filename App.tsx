import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ScreenRenderer } from './src/components/ScreenRenderer';
import { NavigationContext } from './src/navigation/NavigationContext';
import { useScreen } from './src/hooks/useScreen';
import { theme } from './src/theme/theme';
import { messages } from './src/i18n/messages';

const INITIAL_SCREEN = 'home';

export default function App() {
  // Stack de navegación: la última entrada es la pantalla visible.
  const [stack, setStack] = useState<string[]>([INITIAL_SCREEN]);
  const currentScreenId = stack[stack.length - 1];
  const screen = useScreen(currentScreenId);

  const navigate = useCallback((screenId: string) => {
    setStack((prev) => [...prev, screenId]);
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

  const navigation = useMemo(() => ({ navigate }), [navigate]);

  return (
    <SafeAreaProvider>
      <NavigationContext.Provider value={navigation}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="auto" />
          <ScrollView contentContainerStyle={styles.content}>
            {screen ? <ScreenRenderer screen={screen} /> : <Text>{messages.common.loading}</Text>}
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