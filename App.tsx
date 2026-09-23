import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fetchScreen } from './src/api/client';
import { parseScreen, ScreenParseError } from './src/parser/parseScreen';
import { ScreenRenderer } from './src/components/ScreenRenderer';
import type { ScreenDefinition } from './src/types/screen';
import exampleScreen from './src/mocks/exampleScreen.json';

/**
 * USE_MOCK=true mientras el endpoint real del backend no esté listo.
 * Cuando exista, cambiar a false para pedir la pantalla real vía
 * fetchScreen(). No se agrega manejo de errores de red aquí — eso es
 * explícitamente alcance del Prototipo #4.
 */
const USE_MOCK = false;

export default function App() {
  const [screen, setScreen] = useState<ScreenDefinition | null>(null);

  useEffect(() => {
    const raw = USE_MOCK ? exampleScreen : fetchScreen('home');

    Promise.resolve(raw).then((data) => {
      try {
        setScreen(parseScreen(data));
      } catch (error) {
        if (error instanceof ScreenParseError) {
          // Log simple durante el prototipo — sin UI de error todavía
          // (Prototipo #4: "Pantalla de error global").
          console.error('Error al parsear la pantalla:', error.message);
        }
        throw error;
      }
    });
  }, []);

  return (
    // SafeAreaProvider debe envolver la app una sola vez, en la raíz —
    // es lo que le da a SafeAreaView los datos reales del dispositivo
    // (notch, barra de estado, gestos) para calcular el margen seguro.
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <ScrollView contentContainerStyle={styles.content}>
          {screen ? <ScreenRenderer screen={screen} /> : <Text>Cargando...</Text>}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
});
