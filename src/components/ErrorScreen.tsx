import { View, Text, TouchableOpacity } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { useThemedStyles } from '../theme/useTheme';
import { messages } from '../i18n/messages';

interface Props {
  message: string;
  onRetry: () => void;
}

/**
 * Pantalla de error global: se muestra cuando una pantalla no se pudo
 * obtener (red, timeout, HTTP) o no se pudo dibujar (Error Boundary).
 * Es de la app, no del servidor: tiene que funcionar justo cuando el
 * servidor no está disponible.
 */
export function ErrorScreen({ message, onRetry }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{messages.errors.title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>{messages.errors.retry}</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (t: AppTheme) => ({
  container: {
    gap: t.spacing.md,
    paddingVertical: t.spacing.xl,
  },
  title: {
    fontSize: t.fontSize.title,
    fontWeight: t.fontWeight.bold,
    color: t.colors.text,
  },
  message: {
    fontSize: t.fontSize.subtitle,
    color: t.colors.textSecondary,
  },
  button: {
    backgroundColor: t.colors.primary,
    padding: t.field.padding,
    borderRadius: t.radius.sm,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: t.colors.onPrimary,
    fontSize: t.fontSize.body,
    fontWeight: t.fontWeight.bold,
  },
});
