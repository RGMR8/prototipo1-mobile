import { View, Text as RNText, StyleSheet } from 'react-native';
import type { ScreenDefinition } from '../types/screen';
import { ScreenComponentRenderer } from './renderComponent';
import { theme } from '../theme/theme';

/** Punto de entrada: renderiza una pantalla completa ya parseada. */
export function ScreenRenderer({ screen }: { screen: ScreenDefinition }) {
  return (
    <View>
      <RNText style={styles.title}>
        {screen.title}
      </RNText>
      {screen.components.map((component) => (
        <ScreenComponentRenderer key={component.id} component={component} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
});
