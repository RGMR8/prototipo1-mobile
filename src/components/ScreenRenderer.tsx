import { View, Text as RNText } from 'react-native';
import type { ScreenDefinition } from '../types/screen';
import type { AppTheme } from '../theme/theme';
import { useThemedStyles } from '../theme/useTheme';
import { ScreenComponentRenderer } from './renderComponent';

/** Punto de entrada: renderiza una pantalla completa ya parseada. */
export function ScreenRenderer({ screen }: { screen: ScreenDefinition }) {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = (t: AppTheme) => ({
  title: {
    fontSize: t.fontSize.title,
    fontWeight: t.fontWeight.bold,
    marginBottom: t.spacing.md,
    color: t.colors.text,
  },
});